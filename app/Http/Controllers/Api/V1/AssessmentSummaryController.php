<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\AccidentCheck;
use App\Models\AddPoint;
use App\Models\Company;
use App\Models\DailyCheck;
use App\Models\DoubleCheck;
use App\Models\NormCheck;
use App\Models\SystemCheck;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use PhpOffice\PhpWord\TemplateProcessor;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

/**
 * 考核汇总：参考 snap/CheckStatisticsController，组合 6 个维度得出企业总分。
 *
 *   number1 = 日常目标管理工作（daily_checks，直接求和）
 *   number2 = 安全生产标准化（norm_checks；year > 2025 时折算系数为 30，否则 20）
 *   number3 = 双重预防机制（double_checks；year > 2025 废除）
 *   number4 = 活动参与及材料上报（system_checks 总分）
 *   number5 = 安全生产事故（20 - 累计扣分，下限 0）
 *   number6 = 加分项（add_points 求和）
 *   number  = 以上 6 项合计
 */
class AssessmentSummaryController extends Controller
{
    /**
     * 本企业聚合 or 集团（下属企业列表）视图。
     *
     * GET /assessment-summary?company_id=X&year=YYYY&type=bloc|company
     */
    public function summary(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'year' => 'required|integer|min:2022',
            'type' => 'required|in:bloc,company',
        ]);

        $companyId = (int) $request->company_id;
        $year = (int) $request->year;

        if ($request->type === 'bloc') {
            $subIds = Company::query()->where('pid', $companyId)->where('status', 1)->pluck('id');
            $data = $subIds->map(fn (int $id) => $this->computeCompanyScore($id, $year))->values();

            return $this->success($data);
        }

        return $this->success($this->computeCompanyScore($companyId, $year));
    }

    /**
     * 导出单企业或集团汇总为 Word 文档。
     *
     * 参考 snap/CheckStatisticsController：
     *   - 集团：渲染 public/check_bloc.docx（cloneRowAndSetValues('sort', ...) 动态行）
     *   - 企业：year > 2025 使用 check_company_new.docx，否则 check_company.docx
     * 生成后保存至 public/upload/check_word/YYYY/MM/ 并作为附件流式下载返回。
     */
    public function export(Request $request): BinaryFileResponse|JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'year' => 'required|integer|min:2022',
            'type' => 'required|in:bloc,company',
        ]);

        $companyId = (int) $request->company_id;
        $year = (int) $request->year;

        ini_set('pcre.backtrack_limit', '999999999');

        $dir = public_path('upload/check_word/'.date('Y').'/'.date('m').'/');
        if (! is_dir($dir) && ! mkdir($dir, 0777, true) && ! is_dir($dir)) {
            return $this->failed('创建导出目录失败');
        }

        if ($request->type === 'bloc') {
            $subIds = Company::query()->where('pid', $companyId)->where('status', 1)->pluck('id');
            $rows = $subIds->map(fn (int $id) => $this->computeCompanyScore($id, $year))->values()->all();

            $rowValues = [];
            foreach ($rows as $i => $r) {
                $rowValues[] = [
                    'sort' => $i + 1,
                    'company_name' => $r['company_name'],
                    'number' => $r['number'],
                ];
            }

            $templatePath = public_path('check_bloc.docx');
            if (! is_file($templatePath)) {
                return $this->failed('导出模板缺失：check_bloc.docx');
            }

            try {
                $processor = new TemplateProcessor($templatePath);
            } catch (\Throwable $e) {
                return $this->failed('初始化模板失败：'.$e->getMessage());
            }

            $parentTitle = (string) Company::query()->where('id', $companyId)->value('title');
            $processor->setValue('company_title', $parentTitle);
            $processor->setValue('year', (string) $year);
            $processor->cloneRowAndSetValues('sort', $rowValues);

            $reportName = $parentTitle.$year.mt_rand().'考核结果.docx';
        } else {
            $row = $this->computeCompanyScore($companyId, $year);

            $templatePath = $year > 2025
                ? public_path('check_company_new.docx')
                : public_path('check_company.docx');
            if (! is_file($templatePath)) {
                return $this->failed('导出模板缺失：'.basename($templatePath));
            }

            try {
                $processor = new TemplateProcessor($templatePath);
            } catch (\Throwable $e) {
                return $this->failed('初始化模板失败：'.$e->getMessage());
            }

            $processor->setValue('company_name', $row['company_name']);
            $processor->setValue('year', (string) $year);
            $processor->setValue('number', (string) $row['number']);
            $processor->setValue('number1', (string) $row['number1']);
            $processor->setValue('number2', (string) $row['number2']);
            $processor->setValue('number3', (string) $row['number3']);
            $processor->setValue('number4', (string) $row['number4']);
            $processor->setValue('number5', (string) $row['number5']);
            $processor->setValue('number6', (string) $row['number6']);

            $reportName = $row['company_name'].$year.mt_rand().'考核结果.docx';
        }

        $outputPath = $dir.$reportName;
        try {
            $processor->saveAs($outputPath);
        } catch (\Throwable $e) {
            return $this->failed('生成文档失败：'.$e->getMessage());
        }

        return response()->download($outputPath, $reportName, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ])->deleteFileAfterSend(false);
    }

    /**
     * @return array{
     *   company_id: int,
     *   company_name: string,
     *   year: int,
     *   type: string,
     *   number1: float, number2: float, number3: float,
     *   number4: float, number5: float, number6: float,
     *   number: float
     * }
     */
    protected function computeCompanyScore(int $companyId, int $year): array
    {
        // number1: 日常目标管理工作
        $number1 = round((float) DailyCheck::query()
            ->where('company_id', $companyId)->where('year', $year)
            ->sum('number'), 2);

        // number2: 安全生产标准化 (折算)
        $norm = NormCheck::query()->where(['company_id' => $companyId, 'year' => $year])->first();
        $scale = $year > 2025 ? 30 : 20;
        $number2 = $norm ? round(((int) $norm->number / 100) * $scale, 2) : 0.0;

        // number3: 双重预防（2025 年后取消）
        if ($year > 2025) {
            $number3 = 0.0;
        } else {
            $doubleCount = DoubleCheck::query()->where(['company_id' => $companyId, 'year' => $year])->count();
            if ($doubleCount > 0) {
                $rawDouble = (float) DoubleCheck::query()->where(['company_id' => $companyId, 'year' => $year])->sum('number');
                $number3 = round(((100 - $rawDouble) / 100) * 10, 2);
            } else {
                $number3 = 0.0;
            }
        }

        // number4: 活动参与及材料上报情况
        $number4 = round((float) SystemCheck::query()
            ->where(['company_id' => $companyId, 'year' => $year])
            ->sum('number'), 2);

        // number5: 安全生产事故考核指标（20 - 累计扣分，下限 0）
        $accidentCount = AccidentCheck::query()->where(['company_id' => $companyId, 'year' => $year])->count();
        if ($accidentCount > 0) {
            $rawAccident = (float) AccidentCheck::query()->where(['company_id' => $companyId, 'year' => $year])->sum('number');
            $number5 = $rawAccident >= 20 ? 0.0 : round(20 - $rawAccident, 2);
        } else {
            $number5 = 0.0;
        }

        // number6: 加分项
        $number6 = round((float) AddPoint::query()
            ->where(['company_id' => $companyId, 'year' => $year])
            ->sum('number'), 2);

        $total = round($number1 + $number2 + $number3 + $number4 + $number5 + $number6, 2);

        return [
            'company_id' => $companyId,
            'company_name' => (string) Company::query()->where('id', $companyId)->value('title'),
            'year' => $year,
            'type' => $norm?->type ?? '暂无',
            'number1' => $number1,
            'number2' => $number2,
            'number3' => $number3,
            'number4' => $number4,
            'number5' => $number5,
            'number6' => $number6,
            'number' => $total,
        ];
    }
}
