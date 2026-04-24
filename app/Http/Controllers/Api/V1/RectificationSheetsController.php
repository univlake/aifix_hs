<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\Company;
use App\Models\ExpertCompany;
use App\Models\ExpertInspection;
use App\Models\HiddenDangerInfo;
use App\Services\OssService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Worksheet\MemoryDrawing;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * 整改通知单（单企业）与 隐患分类统计表（检查计划级）生成与下载。
 *
 * 权限：
 *   - 单企业整改通知单：计划创建方 / 已指派专家可生成 + 下载；受检企业只可下载。
 *   - 隐患分类统计：仅计划创建方可导出。
 *
 * 文件保存在 storage/app/rectification-sheets/ （非公开路径，通过下载接口鉴权）。
 */
class RectificationSheetsController extends Controller
{
    private const HIDDEN_TYPES = ['危化品', '电气', '机械', '安全设施', '消防', '职业健康', '其他'];

    /**
     * 生成整改通知单（计划创建方 / 已指派专家）。
     */
    public function generate(Request $request, int $id): JsonResponse
    {
        $expertCompany = ExpertCompany::query()
            ->with(['expertInspection', 'checkCompany', 'expertInspectionUsers.expertUser'])
            ->find($id);

        if (! $expertCompany) {
            return $this->notFound('检查记录不存在');
        }

        $user = $request->user();
        $planCompanyId = $expertCompany->expertInspection?->company_id;
        $isOwner = $planCompanyId !== null && (int) $planCompanyId === (int) $user->company_id;
        $isExpert = $expertCompany->expertInspectionUsers
            ->contains(fn ($row) => (int) $row->expert_user_id === (int) $user->id);

        if (! $isOwner && ! $isExpert) {
            return $this->failed('仅计划创建方或指派专家可生成整改通知单');
        }

        try {
            $relPath = $this->buildRectificationSheet($expertCompany);
        } catch (\Throwable $e) {
            return $this->failed('生成整改通知单失败：'.$e->getMessage());
        }

        $expertCompany->update(['rectification_sheet_url' => $relPath]);

        return $this->success($expertCompany->fresh());
    }

    /**
     * 下载整改通知单（计划创建方、已指派专家、受检企业三方均可）。
     */
    public function download(Request $request, int $id): BinaryFileResponse|JsonResponse
    {
        $expertCompany = ExpertCompany::query()
            ->with(['expertInspection', 'expertInspectionUsers'])
            ->find($id);

        if (! $expertCompany) {
            return $this->notFound('检查记录不存在');
        }

        $user = $request->user();
        $planCompanyId = $expertCompany->expertInspection?->company_id;
        $isOwner = $planCompanyId !== null && (int) $planCompanyId === (int) $user->company_id;
        $isExpert = $expertCompany->expertInspectionUsers
            ->contains(fn ($row) => (int) $row->expert_user_id === (int) $user->id);
        $isChecked = (int) $expertCompany->check_company_id === (int) $user->company_id;

        if (! $isOwner && ! $isExpert && ! $isChecked) {
            return $this->failed('无权限下载');
        }

        if (! $expertCompany->rectification_sheet_url) {
            return $this->failed('整改通知单尚未生成');
        }

        $path = storage_path('app/'.$expertCompany->rectification_sheet_url);

        if (! is_file($path)) {
            return $this->failed('文件不存在');
        }

        return response()->download($path, basename($path));
    }

    /**
     * 导出隐患分类统计：按企业范围 + 时间区间 + （可选）单类别过滤，
     * 聚合企业名下所有检查计划产生的隐患。
     */
    public function exportStatistics(Request $request): BinaryFileResponse|JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'start_time' => 'nullable|date',
            'end_time' => 'nullable|date',
            'type' => 'nullable|string|max:64',
        ]);

        $user = $request->user();

        if ((int) $request->company_id !== (int) $user->company_id) {
            return $this->failed('仅可导出本企业的隐患分类统计');
        }

        try {
            $relPath = $this->buildHazardStatistics(
                (int) $request->company_id,
                $request->start_time,
                $request->end_time,
                $request->type && $request->type !== 'all' ? $request->type : null,
            );
        } catch (\Throwable $e) {
            return $this->failed('导出失败：'.$e->getMessage());
        }

        $path = storage_path('app/'.$relPath);

        return response()->download($path, basename($path))->deleteFileAfterSend();
    }

    // ── sheet builders ──────────────────────────────────────────

    private function buildRectificationSheet(ExpertCompany $expertCompany): string
    {
        ini_set('pcre.backtrack_limit', '999999999');

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $this->applyBaseStyle($spreadsheet, $sheet);

        $checkCompanyName = $expertCompany->checkCompany?->title ?? '';
        $supervisor = $expertCompany->checkCompany?->supervise_name ?? '';
        $supervisorTel = $expertCompany->checkCompany?->supervise_tel ?? '';
        $checkTime = (string) ($expertCompany->check_company_time ?? '');

        $dangers = HiddenDangerInfo::query()
            ->where('expert_inspection_id', $expertCompany->expert_inspection_id)
            ->where('expert_company_id', $expertCompany->id)
            ->with(['hiddenExamineAnnex', 'hiddenRectifyAnnex'])
            ->orderBy('id')
            ->get();

        $count = $dangers->count();
        $totalRows = max($count, 0) + 5;

        $sheet->setTitle('整改通知单');
        $sheet->getStyle('A1:H'.$totalRows)->applyFromArray([
            'borders' => ['outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => '000000']]],
        ]);
        $sheet->getStyle('A1:H'.$totalRows)->applyFromArray([
            'borders' => ['inside' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => '000000']]],
        ]);

        $sheet->mergeCells('A1:H1');
        $sheet->mergeCells('A2:H2');

        $sheet->getRowDimension(1)->setRowHeight(40);
        $sheet->getRowDimension(2)->setRowHeight(26);
        $sheet->getRowDimension(3)->setRowHeight(36);

        for ($i = 4; $i <= 3 + $count; $i++) {
            $sheet->getRowDimension($i)->setRowHeight(70);
        }

        $sheet->getStyle('A1')->getFont()->setName('宋体')->setSize(20);
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

        $sheet->setCellValue('A1', '现场隐患描述及整改反馈表（整改期限15个工作日）');
        $sheet->setCellValue('A2', sprintf(
            '企业名称：%s        联系人：%s        联系方式：%s        检查时间：%s',
            $checkCompanyName,
            $supervisor,
            $supervisorTel,
            $checkTime,
        ));
        $sheet->setCellValue('A3', '序号');
        $sheet->setCellValue('B3', '不符合项描述');
        $sheet->setCellValue('C3', '整改前图片');
        $sheet->setCellValue('D3', '整改依据');
        $sheet->setCellValue('E3', '整改建议');
        $sheet->setCellValue('F3', '隐患类别');
        $sheet->setCellValue('G3', '整改后图片');
        $sheet->setCellValue('H3', '整改情况说明');

        foreach ($dangers as $i => $danger) {
            $row = $i + 4;
            $sheet->setCellValue('A'.$row, $i + 1);
            $sheet->setCellValue('B'.$row, ($danger->area ?? '').':'.($danger->description ?? ''));
            $sheet->setCellValue('D'.$row, $danger->legalises ?? '');
            $sheet->setCellValue('E'.$row, $danger->proposal ?? '');
            $sheet->setCellValue('F'.$row, ($danger->hidden_type ?? '').'/'.($danger->hidden_level ?? ''));
            $sheet->setCellValue('H'.$row, $danger->review_description ?? '');

            $this->embedImage($sheet, 'C'.$row, $danger->hiddenExamineAnnex?->first()?->annex_url);
            $this->embedImage($sheet, 'G'.$row, $danger->hiddenRectifyAnnex?->first()?->annex_url);
        }

        $auditRow = $count + 4;
        $sheet->mergeCells('A'.$auditRow.':H'.$auditRow);
        $sheet->mergeCells('A'.($auditRow + 1).':H'.($auditRow + 1));
        $sheet->getRowDimension($auditRow)->setRowHeight(180);
        $sheet->getStyle('A'.$auditRow.':A'.($auditRow + 1))->getAlignment()->setWrapText(true);
        $sheet->getStyle('A'.$auditRow.':A'.($auditRow + 1))->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

        $sheet->setCellValue('A'.$auditRow, $this->buildAuditNarrative($expertCompany, $dangers));
        $sheet->setCellValue('A'.($auditRow + 1), '备注：隐患分七类（危化品、电气、机械、安全设施、消防、职业健康、其他）。');

        return $this->saveAs($spreadsheet, '整改通知单-'.$checkCompanyName);
    }

    private function buildHazardStatistics(int $companyId, ?string $startTime, ?string $endTime, ?string $type): string
    {
        ini_set('pcre.backtrack_limit', '999999999');

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $this->applyBaseStyle($spreadsheet, $sheet);

        $inspectionIds = ExpertInspection::query()
            ->where('company_id', $companyId)
            ->pluck('id');

        $companyTitle = Company::query()->where('id', $companyId)->value('title') ?? '';
        $types = $type === null ? self::HIDDEN_TYPES : [$type];

        $buckets = [];

        foreach ($types as $t) {
            $query = HiddenDangerInfo::query()
                ->whereIn('expert_inspection_id', $inspectionIds)
                ->where('hidden_type', $t);

            if ($startTime) {
                $query->where('created_at', '>=', $startTime);
            }

            if ($endTime) {
                $query->where('created_at', '<=', $endTime);
            }

            $buckets[$t] = $query->with(['hiddenExamineAnnex', 'hiddenRectifyAnnex'])
                ->orderBy('id')
                ->get();
        }

        $totalCount = array_sum(array_map(fn ($c) => $c->count(), $buckets));
        $bucketHeaderCount = count(array_filter($buckets, fn ($c) => $c->count() > 0));
        $totalRows = $totalCount + $bucketHeaderCount + 3;

        $sheet->setTitle('隐患排查分类统计表');
        if ($totalRows >= 3) {
            $sheet->getStyle('A1:H'.$totalRows)->applyFromArray([
                'borders' => ['outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['argb' => '000000']]],
            ]);
            $sheet->getStyle('A1:H'.$totalRows)->applyFromArray([
                'borders' => ['inside' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['argb' => '000000']]],
            ]);
        }
        $sheet->mergeCells('A1:H1');
        $sheet->mergeCells('A2:H2');

        $sheet->getRowDimension(1)->setRowHeight(40);
        $sheet->getRowDimension(2)->setRowHeight(26);
        $sheet->getRowDimension(3)->setRowHeight(36);

        $sheet->getStyle('A1')->getFont()->setName('宋体')->setSize(20);
        $sheet->getStyle('A2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

        $sheet->setCellValue('A1', '隐患排查分类统计表 · '.$companyTitle);
        $sheet->setCellValue('A2', sprintf(
            '统计时间：%s ~ %s%s',
            $startTime ?? '—',
            $endTime ?? '—',
            $type ? '　|　类别：'.$type : '',
        ));
        $sheet->setCellValue('A3', '序号');
        $sheet->setCellValue('B3', '不符合项描述');
        $sheet->setCellValue('C3', '整改前图片');
        $sheet->setCellValue('D3', '整改依据');
        $sheet->setCellValue('E3', '整改建议');
        $sheet->setCellValue('F3', '隐患类别');
        $sheet->setCellValue('G3', '整改后图片');
        $sheet->setCellValue('H3', '整改情况说明');

        $row = 4;

        foreach ($types as $t) {
            $bucket = $buckets[$t];

            if ($bucket->isEmpty()) {
                continue;
            }

            $sheet->mergeCells('A'.$row.':H'.$row);
            $sheet->setCellValue('A'.$row, $t.'类隐患');
            $sheet->getRowDimension($row)->setRowHeight(36);
            $row++;

            foreach ($bucket as $i => $danger) {
                $sheet->setCellValue('A'.$row, $i + 1);
                $sheet->setCellValue('B'.$row, ($danger->area ?? '').':'.($danger->description ?? ''));
                $sheet->setCellValue('D'.$row, $danger->legalises ?? '');
                $sheet->setCellValue('E'.$row, $danger->proposal ?? '');
                $sheet->setCellValue('F'.$row, ($danger->hidden_type ?? '').'/'.($danger->hidden_level ?? ''));
                $sheet->setCellValue('H'.$row, $danger->review_description ?? '');

                $this->embedImage($sheet, 'C'.$row, $danger->hiddenExamineAnnex?->first()?->annex_url);
                $this->embedImage($sheet, 'G'.$row, $danger->hiddenRectifyAnnex?->first()?->annex_url);

                $sheet->getRowDimension($row)->setRowHeight(70);
                $row++;
            }
        }

        return $this->saveAs($spreadsheet, '隐患分类统计-'.$companyTitle);
    }

    // ── helpers ──────────────────────────────────────────────────

    private function applyBaseStyle(Spreadsheet $spreadsheet, Worksheet $sheet): void
    {
        $spreadsheet->getDefaultStyle()->applyFromArray([
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => true,
            ],
            'font' => ['name' => '宋体', 'size' => 11],
        ]);

        $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_PORTRAIT);
        $sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_A4);
        $sheet->getPageSetup()->setScale(50);

        $sheet->getColumnDimension('A')->setWidth(9.08);
        $sheet->getColumnDimension('B')->setWidth(32.08);
        $sheet->getColumnDimension('C')->setWidth(24.08);
        $sheet->getColumnDimension('D')->setWidth(28.08);
        $sheet->getColumnDimension('E')->setWidth(28.08);
        $sheet->getColumnDimension('F')->setWidth(20.08);
        $sheet->getColumnDimension('G')->setWidth(24.08);
        $sheet->getColumnDimension('H')->setWidth(24.08);
    }

    private function embedImage(Worksheet $sheet, string $coordinate, ?string $url): void
    {
        if (! $url) {
            return;
        }

        try {
            // Bucket is private; raw URL returns 403 for server-side fetch.
            $signed = OssService::signUrl($url, 600);
            $bytes = @file_get_contents($signed);

            if ($bytes === false) {
                return;
            }
            $resource = @imagecreatefromstring($bytes);

            if ($resource === false) {
                return;
            }

            $drawing = new MemoryDrawing;
            $drawing->setImageResource($resource);
            $drawing->setWidth(146);
            $drawing->setHeight(82);
            $drawing->setOffsetX(4);
            $drawing->setOffsetY(4);
            $drawing->setCoordinates($coordinate);
            $drawing->setWorksheet($sheet);
        } catch (\Throwable) {
            // skip image embedding on failure; leave the cell blank
        }
    }

    /**
     * 生成底部留痕文本：通知 → 发出 → 专家确认 → 企业确认 → 隐患下发 → 企业整改 → 专家确认整改 → 归档。
     */
    private function buildAuditNarrative(ExpertCompany $expertCompany, $dangers): string
    {
        $checkCompanyName = $expertCompany->checkCompany?->title ?? '';
        $planCompanyTitle = Company::query()->where('id', $expertCompany->expertInspection?->company_id)->value('title') ?? '';
        $line = ($expertCompany->created_at ?? '').'， '.$planCompanyTitle.'发出检查通知';

        $expertNames = [];

        foreach ($expertCompany->expertInspectionUsers as $assignee) {
            $name = $assignee->expertUser?->nickname ?? ('专家#'.$assignee->expert_user_id);
            $expertNames[] = $name;

            if ($assignee->confirm_time) {
                $line .= "\n".$assignee->confirm_time.'， '.$name.'专家确认接收';
            } else {
                $line .= "\n".$name.'专家未接收';
            }
        }

        $expertNameCsv = implode('、', $expertNames);

        if ($expertCompany->confirm_time) {
            $line .= "\n".$expertCompany->confirm_time.'， '.$checkCompanyName.'确认接收';
        } else {
            $line .= "\n".$checkCompanyName.'未接收';
        }

        if ($dangers->isNotEmpty()) {
            $firstCreated = $dangers->min('created_at');
            $line .= "\n".$firstCreated.'， '.$expertNameCsv.'专家执行检查任务，下发隐患整改单';

            $total = $dangers->count();
            $rectifiedCount = $dangers->filter(fn ($d) => ! empty($d->correct_date))->count();

            if ($rectifiedCount === $total && $total > 0) {
                $latest = $dangers->sortByDesc('correct_date')->first();
                $line .= "\n".$latest->correct_date.'， '.$checkCompanyName.'完成整改，反馈整改情况';
            }

            $reviewedCount = $dangers->filter(fn ($d) => ! empty($d->review_time))->count();

            if ($reviewedCount > 0) {
                $firstReview = $dangers->filter(fn ($d) => ! empty($d->review_time))->sortBy('review_time')->first();
                $line .= "\n".$firstReview->review_time.'， '.$expertNameCsv.'专家进行整改确认';
            }

            if ($reviewedCount === $total && $total > 0) {
                $lastReview = $dangers->filter(fn ($d) => ! empty($d->review_time))->sortByDesc('review_time')->first();
                $line .= "\n".$lastReview->review_time.'， '.$expertNameCsv.'专家完成整改确认';
            }

            $archivedCount = $dangers->filter(fn ($d) => ! empty($d->archive_user_id))->count();

            if ($archivedCount === $total && $total > 0) {
                $last = $dangers->sortByDesc('updated_at')->first();
                $line .= "\n".$last->updated_at.'， '.$planCompanyTitle.'确认归档';
            }
        }

        return $line;
    }

    private function saveAs(Spreadsheet $spreadsheet, string $baseName): string
    {
        $relDir = 'rectification-sheets/'.date('Y').'/'.date('m');
        $absDir = storage_path('app/'.$relDir);

        if (! is_dir($absDir)) {
            mkdir($absDir, 0755, true);
        }

        $filename = $baseName.'-'.date('Ymd').'-'.Str::random(6).'.xlsx';
        $relPath = $relDir.'/'.$filename;

        $writer = IOFactory::createWriter($spreadsheet, 'Xlsx');
        $writer->save(storage_path('app/'.$relPath));

        return $relPath;
    }
}
