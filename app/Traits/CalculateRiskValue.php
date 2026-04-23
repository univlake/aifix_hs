<?php

namespace App\Traits;

use App\Enums\CorrectionResult;
use App\Enums\MajorHazardLevel;
use App\Enums\StandardizationGrade;
use App\Models\AccidentBulletin;
use App\Models\AssessDetect;
use App\Models\CertificateStatus;
use App\Models\Company;
use App\Models\DangerousEquipment;
use App\Models\DesignUnit;
use App\Models\EmergencyDrill;
use App\Models\EmergencyTeam;
use App\Models\EvaluationUnit;
use App\Models\FloatRiskLog;
use App\Models\FundingExecution;
use App\Models\HazardousChemical;
use App\Models\HazardousProcess;
use App\Models\HealthCheckup;
use App\Models\HealthReport;
use App\Models\HealthSystem;
use App\Models\InherentRiskLog;
use App\Models\InternalMeeting;
use App\Models\InternalTraining;
use App\Models\JobManagement;
use App\Models\MajorHazard;
use App\Models\MajorHazardousProcess;
use App\Models\MonthlyInvestigation;
use App\Models\OccupationalHazard;
use App\Models\Personnel;
use App\Models\ProductionStandardization;
use App\Models\RiskLog;
use App\Models\SafetyArchitecture;
use App\Models\SecurityInvestment;
use App\Models\SkillUnit;
use App\Models\SpecialEquipment;
use App\Models\ThreeTogether;
use Illuminate\Support\Facades\DB;

trait CalculateRiskValue
{
    public function countRisk(string $content): void
    {
        // ── Constants ────────────────────────────────────────────────────────
        $currentYear = (int) date('Y');
        $today = date('Y-m-d');
        $tenYearsAgo = date('Y-m-d', strtotime('-10 years'));
        $startOfYear = $currentYear.'-01-01';
        $daysThisYear = max(1, (int) floor((time() - strtotime($startOfYear)) / 86400));
        $now = now()->toDateTimeString();

        // ── Load produce companies ───────────────────────────────────────────
        $companies = Company::where('is_produce', '1')->where('status', 1)->get();
        $companyIds = $companies->pluck('id')->toArray();

        if (empty($companyIds)) {
            return;
        }

        // ── Reset today's logs ───────────────────────────────────────────────
        try {
            DB::table('risk_max_values')->truncate();
            RiskLog::whereDate('created_at', $today)->delete();
            FloatRiskLog::whereDate('created_at', $today)->delete();
            InherentRiskLog::whereDate('created_at', $today)->delete();
        } catch (\Exception $e) {
        }

        // ── Bulk load all required data (one query per model) ────────────────
        $personnelByCompany = Personnel::whereIn('company_id', $companyIds)->get()->keyBy('company_id');
        $certByCompany = CertificateStatus::whereIn('company_id', $companyIds)->where('type', 1)->where('name', '安全管理员')->get()->keyBy('company_id');
        $secInvByCompany = SecurityInvestment::whereIn('company_id', $companyIds)->where('year', $currentYear)->selectRaw('company_id, SUM(budget) AS budget_sum, SUM(last_year_income) AS income_sum, COUNT(*) AS cnt')->groupBy('company_id')->get()->keyBy('company_id');
        $fundingExecSums = FundingExecution::whereIn('company_id', $companyIds)->where('year', $currentYear)->selectRaw('company_id, SUM(budget) AS budget_sum')->groupBy('company_id')->pluck('budget_sum', 'company_id');
        $majorHazProcTotal = MajorHazardousProcess::whereIn('company_id', $companyIds)->selectRaw('company_id, COUNT(*) AS total')->groupBy('company_id')->pluck('total', 'company_id');
        $majorHazProcOver = MajorHazardousProcess::whereIn('company_id', $companyIds)->where('operating_people_num', '>', 3)->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $hazProcTotal = HazardousProcess::whereIn('company_id', $companyIds)->selectRaw('company_id, COUNT(*) AS total')->groupBy('company_id')->pluck('total', 'company_id');
        $hazProcOver = HazardousProcess::whereIn('company_id', $companyIds)->where('operating_people_num', '>', 3)->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $hazProcAuto = HazardousProcess::whereIn('company_id', $companyIds)->where('is_automatic', 1)->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $hazChemStats = HazardousChemical::whereIn('company_id', $companyIds)->selectRaw(
            "company_id,
             COUNT(*) AS total,
             SUM(CASE WHEN is_explosion = 1 THEN 1 ELSE 0 END) AS explosion_cnt,
             SUM(CASE WHEN is_toxin = 1 AND matter_state = '气态' THEN 1 ELSE 0 END) AS toxin_gas_cnt,
             SUM(CASE WHEN fire_class = '甲类' AND matter_state = '气态' THEN 1 ELSE 0 END) AS fire_a_cnt,
             SUM(CASE WHEN fire_class = '乙类' AND matter_state = '气态' THEN 1 ELSE 0 END) AS fire_b_cnt"
        )->groupBy('company_id')->get()->keyBy('company_id');
        $internalMeetingCounts = InternalMeeting::whereIn('company_id', $companyIds)->whereYear('created_at', $currentYear)->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $internalTrainingCounts = InternalTraining::whereIn('company_id', $companyIds)->whereYear('created_at', $currentYear)->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $accidentStats = AccidentBulletin::whereIn('company_id', $companyIds)->whereYear('created_at', $currentYear)->selectRaw(
            "company_id,
             COUNT(*) AS total,
             SUM(CASE WHEN accident_level = '轻伤事故' THEN 1 ELSE 0 END) AS light_cnt,
             SUM(CASE WHEN accident_level = '重伤事故' THEN 1 ELSE 0 END) AS serious_cnt,
             SUM(CASE WHEN accident_level NOT IN ('轻伤事故','重伤事故') THEN 1 ELSE 0 END) AS other_cnt,
             SUM(CASE WHEN accident_report_url IS NOT NULL THEN 1 ELSE 0 END) AS reported_cnt"
        )->groupBy('company_id')->get()->keyBy('company_id');
        $emergencyTeamSums = EmergencyTeam::whereIn('company_id', $companyIds)->selectRaw('company_id, SUM(team_number) AS team_sum')->groupBy('company_id')->pluck('team_sum', 'company_id');
        $emergencyDrillCounts = EmergencyDrill::whereIn('company_id', $companyIds)->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $jobManagementCounts = JobManagement::whereIn('company_id', $companyIds)->whereYear('created_at', $currentYear)->where('type', '八大特殊作业')->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $occupationalHazSums = OccupationalHazard::whereIn('company_id', $companyIds)->selectRaw('company_id, SUM(number) AS num_sum')->groupBy('company_id')->pluck('num_sum', 'company_id');
        $safetyArchCounts = SafetyArchitecture::whereIn('company_id', $companyIds)->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $productionStdByCompany = ProductionStandardization::whereIn('company_id', $companyIds)->get()->keyBy('company_id');
        $healthSystemByCompany = HealthSystem::whereIn('company_id', $companyIds)->get()->keyBy('company_id');
        $assessDetectCounts = AssessDetect::whereIn('company_id', $companyIds)->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $spEqTotal = SpecialEquipment::whereIn('company_id', $companyIds)->selectRaw('company_id, COUNT(*) AS total')->groupBy('company_id')->pluck('total', 'company_id');
        $spEqOld = SpecialEquipment::whereIn('company_id', $companyIds)->where('use_time', '<', $tenYearsAgo)->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $dangEqTotal = DangerousEquipment::whereIn('company_id', $companyIds)->selectRaw('company_id, COUNT(*) AS total')->groupBy('company_id')->pluck('total', 'company_id');
        $dangEqOld = DangerousEquipment::whereIn('company_id', $companyIds)->where('use_time', '<', $tenYearsAgo)->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $majorHazardByCompany = MajorHazard::whereIn('company_id', $companyIds)->get()->groupBy('company_id');
        $monthlyInvTotal = MonthlyInvestigation::whereIn('company_id', $companyIds)->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $monthlyInvDone = MonthlyInvestigation::whereIn('company_id', $companyIds)->where('correct_result', CorrectionResult::Rectified->value)->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $threeTotalCounts = ThreeTogether::whereIn('company_id', $companyIds)->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $threeOverCounts = ThreeTogether::whereIn('company_id', $companyIds)->where('status', 4)->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $skillUnitTotal = SkillUnit::whereIn('company_id', $companyIds)->selectRaw('company_id, COUNT(*) AS total')->groupBy('company_id')->pluck('total', 'company_id');
        $skillUnitQualified = SkillUnit::whereIn('company_id', $companyIds)->has('skillUnitKids')->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $evalUnitTotal = EvaluationUnit::whereIn('company_id', $companyIds)->selectRaw('company_id, COUNT(*) AS total')->groupBy('company_id')->pluck('total', 'company_id');
        $evalUnitQualified = EvaluationUnit::whereIn('company_id', $companyIds)->where('is_qualification', 1)->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $evalUnitAgreement = EvaluationUnit::whereIn('company_id', $companyIds)->whereNotNull('agreement_annex_url')->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $evalUnitTrained = EvaluationUnit::whereIn('company_id', $companyIds)->where('is_agreement', 1)->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $designUnitTotal = DesignUnit::whereIn('company_id', $companyIds)->selectRaw('company_id, COUNT(*) AS total')->groupBy('company_id')->pluck('total', 'company_id');
        $designUnitQualified = DesignUnit::whereIn('company_id', $companyIds)->whereNotNull('qualification_name')->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');
        $healthCheckupSums = HealthCheckup::whereIn('company_id', $companyIds)->selectRaw('company_id, SUM(number) AS num_sum')->groupBy('company_id')->pluck('num_sum', 'company_id');
        $healthReportCounts = HealthReport::whereIn('company_id', $companyIds)->selectRaw('company_id, COUNT(*) AS cnt')->groupBy('company_id')->pluck('cnt', 'company_id');

        // ── Phase 1: Raw metrics (risk_max_values) ───────────────────────────
        $riskMaxRows = [];
        $riskMaxByCid = [];

        foreach ($companies as $company) {
            $cid = $company->id;
            $personnel = $personnelByCompany->get($cid);
            $row = ['company_id' => $cid];

            // 安管员数量比例
            if ($personnel && $personnel->total_people > 0 && $personnel->security_officer > 0) {
                $row['security_officer_scale'] = $personnel->security_officer / $personnel->total_people;
            }

            // 持证安全管理员比例
            $cert = $certByCompany->get($cid);
            if ($cert && $personnel && $cert->already_obtain_people > 0 && $personnel->security_officer > 0) {
                $row['already_obtain_people_scale'] = $cert->already_obtain_people / $personnel->security_officer;
            }

            // 年度安全投入占上一年营收比例
            $secInv = $secInvByCompany->get($cid);
            if ($secInv && $secInv->budget_sum > 0 && $secInv->income_sum > 0) {
                $row['last_year_income_scale'] = $secInv->budget_sum / $secInv->income_sum * $secInv->cnt;
            }

            // 企业用工总人数/占地面积
            if ($personnel && $company->acreage > 0 && $personnel->total_people > 0) {
                $row['acreage_scale'] = $personnel->total_people / $company->acreage;
            }

            // （重点监管危险工艺数量+较大危险工艺数量）/企业用工总人数
            $totalHazProc = (int) $majorHazProcTotal->get($cid, 0) + (int) $hazProcTotal->get($cid, 0);
            if ($personnel && $totalHazProc > 0 && $personnel->total_people > 0) {
                $row['hazardous_processes_scale'] = $totalHazProc / $personnel->total_people;
            }

            // 危险物质数量/企业用工数量
            $hazChemRow = $hazChemStats->get($cid);
            $hazChemCount = $hazChemRow ? (int) $hazChemRow->total : 0;
            if ($personnel && $hazChemCount > 0 && $personnel->total_people > 0) {
                $row['hazardous_chemicals_scale'] = $hazChemCount / $personnel->total_people;
            }

            // 平均每月的会议次数
            $meetingCount = (int) $internalMeetingCounts->get($cid, 0);
            if ($meetingCount > 0) {
                $row['internal_meeting_scale'] = $meetingCount / $daysThisYear * 30;
            }

            // 平均每月的培训次数
            $trainingCount = (int) $internalTrainingCounts->get($cid, 0);
            if ($trainingCount > 0) {
                $row['internal_training_scale'] = $trainingCount / $daysThisYear * 30;
            }

            // 事故发生频率 次数/年
            $accRow = $accidentStats->get($cid);
            $accidentCount = $accRow ? (int) $accRow->total : 0;
            if ($accidentCount > 0) {
                $row['accident_bulletin_scale'] = $accidentCount / $daysThisYear * 365;
            }

            // 应急队伍总人数/企业用工总数
            $teamSum = (float) $emergencyTeamSums->get($cid, 0);
            if ($personnel && $teamSum > 0 && $personnel->total_people > 0) {
                $row['emergency_team_scale'] = $teamSum / $personnel->total_people;
            }

            // 年平均演练次数（建立后满1年起算，避免除以零）
            $drillCount = (int) $emergencyDrillCounts->get($cid, 0);
            $years = max(1, $currentYear - (int) date('Y', strtotime($company->created_at)));
            if ($drillCount > 0) {
                $row['emergency_drill_scale'] = $drillCount / $years;
            }

            // 平均每月的特殊作业次数
            $jobCount = (int) $jobManagementCounts->get($cid, 0);
            if ($jobCount > 0) {
                $row['job_management_scale'] = $jobCount / $daysThisYear * 30;
            }

            // 职业病危害数量/企业用工总数
            $occHazSum = (float) $occupationalHazSums->get($cid, 0);
            if ($personnel && $occHazSum > 0 && $personnel->total_people > 0) {
                $row['health_checkup_scale'] = $occHazSum / $personnel->total_people;
            }

            $riskMaxRows[] = $row;
            $riskMaxByCid[$cid] = $row;
        }

        // Bulk insert risk_max_values
        $insertRows = array_map(fn ($r) => array_merge($r, ['created_at' => $now, 'updated_at' => $now]), $riskMaxRows);
        foreach (array_chunk($insertRows, 500) as $chunk) {
            DB::table('risk_max_values')->insert($chunk);
        }

        // Compute global MAX values in PHP — no repeated DB queries needed
        $maxKeys = ['security_officer_scale', 'already_obtain_people_scale', 'last_year_income_scale', 'acreage_scale', 'hazardous_processes_scale', 'hazardous_chemicals_scale', 'internal_meeting_scale', 'internal_training_scale', 'accident_bulletin_scale', 'emergency_team_scale', 'emergency_drill_scale', 'job_management_scale', 'health_checkup_scale'];
        $globalMax = array_fill_keys($maxKeys, 0.0);
        foreach ($riskMaxRows as $row) {
            foreach ($maxKeys as $key) {
                $val = (float) ($row[$key] ?? 0);
                if ($val > $globalMax[$key]) {
                    $globalMax[$key] = $val;
                }
            }
        }

        // ── Phase 2: Inherent risk ────────────────────────────────────────────
        $inherentLogRows = [];
        $riskLogRows = [];

        foreach ($companies as $company) {
            $cid = $company->id;
            $personnel = $personnelByCompany->get($cid);
            $self = $riskMaxByCid[$cid] ?? [];
            $logs = [];

            // 行业权重
            $weights = match ((string) $company->enterprise_type_id) {
                '1' => 0.8,
                '2' => 0.6,
                '3' => 0.9,
                default => 1.0,
            };

            // 安全管理组织机构
            if ((int) $safetyArchCounts->get($cid, 0) > 0) {
                $logs['safety_architecture_value'] = 0.02496;
            }

            // 安管员数量比例
            if (! empty($self['security_officer_scale']) && $globalMax['security_officer_scale'] > 0) {
                $logs['security_officer_scale'] = $self['security_officer_scale'] / $globalMax['security_officer_scale'] * 0.007345;
            }

            // 持证安全管理人员比例
            if (! empty($self['already_obtain_people_scale']) && $globalMax['already_obtain_people_scale'] > 0) {
                $logs['already_obtain_people_scale'] = $self['already_obtain_people_scale'] / $globalMax['already_obtain_people_scale'] * 0.007345;
            }

            // 年度经费预算比例
            if (! empty($self['last_year_income_scale']) && $globalMax['last_year_income_scale'] > 0) {
                $logs['last_year_income_scale'] = $self['last_year_income_scale'] / $globalMax['last_year_income_scale'] * 0.007345;
            }

            // 执行进度
            $fundingSum = (float) $fundingExecSums->get($cid, 0);
            $secInv = $secInvByCompany->get($cid);
            $secInvBudget = $secInv ? (float) $secInv->budget_sum : 0.0;
            if ($fundingSum > 0 && $secInvBudget > 0) {
                $logs['funding_execution_scale'] = $fundingSum / $secInvBudget * 0.007345;
            }

            // 安全生产标准化
            $prodStd = $productionStdByCompany->get($cid);
            if ($prodStd) {
                $logs['production_standardization_scale'] = match ($prodStd->grade) {
                    StandardizationGrade::Level1->value => 0.9 * 0.002665,
                    StandardizationGrade::Level2->value => 0.75 * 0.002665,
                    StandardizationGrade::Level3->value => 0.6 * 0.002665,
                    default => 0,
                };
            }

            // 职业健康管理体系
            if ($healthSystemByCompany->has($cid)) {
                $logs['health_system_scale'] = 0.002665;
            }

            // 安全评价和检测
            if ((int) $assessDetectCounts->get($cid, 0) > 0) {
                $logs['assess_detect_scale'] = 0.00533;
            }

            // 高中以上学历比例
            if ($personnel && $personnel->high_school_diploma > 0 && $personnel->total_people > 0) {
                $logs['high_school_diploma_scale'] = $personnel->high_school_diploma / $personnel->total_people * 0.014235;
            }

            // 单位占地面积用工数量
            if (! empty($self['acreage_scale']) && $globalMax['acreage_scale'] > 0) {
                $logs['acreage_scale'] = $self['acreage_scale'] / $globalMax['acreage_scale'] * 0.007865;
            }

            // 合同制员工比例
            if ($personnel && $personnel->staff > 0 && $personnel->total_people > 0) {
                $logs['staff_scale'] = $personnel->staff / $personnel->total_people * 0.007865;
            }

            // 安全工程专业人员比例
            if ($personnel && $personnel->safety_engineering_major > 0 && $personnel->security_officer > 0) {
                $logs['safety_engineering_major_scale'] = $personnel->safety_engineering_major / $personnel->security_officer * 0.035035;
            }

            // 人均危险工艺数量
            if (! empty($self['hazardous_processes_scale']) && $globalMax['hazardous_processes_scale'] > 0) {
                $logs['hazardous_processes_scale'] = (1 - $self['hazardous_processes_scale'] / $globalMax['hazardous_processes_scale']) * 0.14775;
            }

            // 涉及危险化学品的工艺数量比例
            $majHazCount = (int) $majorHazProcTotal->get($cid, 0);
            $hazProcCount = (int) $hazProcTotal->get($cid, 0);
            $snap1 = $majHazCount + $hazProcCount;
            if ($majHazCount > 0 && $snap1 > 0) {
                $logs['hazardous_process_scale'] = (1 - $majHazCount / $snap1) * 0.04925;
            }

            // 操作人数超过3人以上的危险工艺比例
            $majHazOverCount = (int) $majorHazProcOver->get($cid, 0);
            $hazProcOverCount = (int) $hazProcOver->get($cid, 0);
            $snap = $majHazOverCount + $hazProcOverCount;
            if ($snap > 0 && $snap1 > 0) {
                $logs['hazardous_process_more_scale'] = (1 - $snap / $snap1) * 0.14775;
            }

            // 工艺中自动化比例
            $hazProcAutoCount = (int) $hazProcAuto->get($cid, 0);
            if ($hazProcAutoCount > 0 && $snap1 > 0) {
                $logs['process_is_automatic_scale'] = $hazProcAutoCount / $snap1 * 0.04925;
            }

            // 特种设备规模
            $spEqCount = (int) $spEqTotal->get($cid, 0);
            $dangEqCount = (int) $dangEqTotal->get($cid, 0);
            $snap2 = $spEqCount + $dangEqCount;
            if ($spEqCount > 0 && $snap2 > 0) {
                $logs['special_equipment_number_scale'] = (1 - $spEqCount / $snap2) * 0.119;
            }

            // 运行超过10年的危险设备数量比例
            $spEqOldCount = (int) $spEqOld->get($cid, 0);
            $dangEqOldCount = (int) $dangEqOld->get($cid, 0);
            $snap3 = $spEqOldCount + $dangEqOldCount;
            if ($snap3 > 0 && $snap2 > 0) {
                $logs['equipment_more_number_scale'] = (1 - $snap3 / $snap2) * 0.119;
            }

            // 爆炸品/有毒气体/易燃气体物质数量比例
            $hazChemRow = $hazChemStats->get($cid);
            $hazChemCount = $hazChemRow ? (int) $hazChemRow->total : 0;
            $hazChemSnapCount = $hazChemRow
                ? ((int) $hazChemRow->explosion_cnt + (int) $hazChemRow->toxin_gas_cnt + (int) $hazChemRow->fire_a_cnt + (int) $hazChemRow->fire_b_cnt)
                : 0;
            if ($hazChemSnapCount > 0 && $hazChemCount > 0) {
                $logs['hazardous_chemical_scale'] = (1 - $hazChemSnapCount / $hazChemCount) * 0.158746;
            }

            // 危险物质数量/人数
            if (! empty($self['hazardous_chemicals_scale']) && $globalMax['hazardous_chemicals_scale'] > 0) {
                $logs['hazardous_chemicals_number_scale'] = (1 - $self['hazardous_chemicals_scale'] / $globalMax['hazardous_chemicals_scale']) * 0.0594405;
            }

            // 重大危险源
            $levels = $majorHazardByCompany->get($cid, collect())->pluck('level')->toArray();
            $logs['major_hazard_scale'] = match (true) {
                in_array(MajorHazardLevel::Level1->value, $levels) => 0.6 * 0.0198135,
                in_array(MajorHazardLevel::Level2->value, $levels) => 0.7 * 0.0198135,
                in_array(MajorHazardLevel::Level3->value, $levels) => 0.8 * 0.0198135,
                in_array(MajorHazardLevel::Level4->value, $levels) => 0.9 * 0.0198135,
                default => 1.0 * 0.0198135,
            };

            // 计算固有风险值
            $inherentRisk = round(array_sum($logs) * $weights * 100, 2);
            $inherentRiskGrade = $this->riskGrade($inherentRisk);

            $inherentLogRows[] = array_merge($logs, ['company_id' => $cid, 'created_at' => $now, 'updated_at' => $now]);
            $riskLogRows[] = [
                'company_id' => $cid,
                'type' => 1,
                'old_risk_num' => $company->inherent_risk,
                'risk_num' => $inherentRisk,
                'date' => date('Ymd'),
                'content' => $content,
                'company_name' => $company->title,
                'old_risk_grade' => $company->inherent_risk_grade,
                'risk_grade' => $inherentRiskGrade,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            Company::where('id', $cid)->update(['inherent_risk' => $inherentRisk, 'inherent_risk_grade' => $inherentRiskGrade]);
        }

        foreach (array_chunk($inherentLogRows, 500) as $chunk) {
            DB::table('inherent_risk_logs')->insert($chunk);
        }

        // ── Phase 3: Float (dynamic) risk ────────────────────────────────────
        $floatLogRows = [];

        foreach ($companies as $company) {
            $cid = $company->id;
            $personnel = $personnelByCompany->get($cid);
            $self = $riskMaxByCid[$cid] ?? [];
            $logs = [];

            // 会议频次
            if (! empty($self['internal_meeting_scale']) && $globalMax['internal_meeting_scale'] > 0) {
                $logs['internal_meeting_scale'] = $self['internal_meeting_scale'] / $globalMax['internal_meeting_scale'] * 0.031635;
            }

            // 培训频次
            if (! empty($self['internal_training_scale']) && $globalMax['internal_training_scale'] > 0) {
                $logs['internal_training_scale'] = $self['internal_training_scale'] / $globalMax['internal_training_scale'] * 0.063365;
            }

            // 事故发生频率
            if (! empty($self['accident_bulletin_scale']) && $globalMax['accident_bulletin_scale'] > 0) {
                $logs['accident_bulletin_scale'] = (1 - $self['accident_bulletin_scale'] / $globalMax['accident_bulletin_scale']) * 0.10075035;
            }

            // 事故严重程度
            $accRow = $accidentStats->get($cid);
            $lightCount = $accRow ? (int) $accRow->light_cnt : 0;
            $seriousCount = $accRow ? (int) $accRow->serious_cnt : 0;
            $otherCount = $accRow ? (int) $accRow->other_cnt : 0;
            $logs['accident_bulletin_severe_scale'] = match (true) {
                $otherCount > 0 => 0,
                $seriousCount > 0 => 0.3 * 0.058859415,
                $lightCount > 0 => 0.6 * 0.058859415,
                default => 1.0 * 0.058859415,
            };

            // "四不放过"情况
            $reportedCount = $accRow ? (int) $accRow->reported_cnt : 0;
            if ($reportedCount > 0) {
                $logs['accident_report_url_scale'] = 0.017145235;
            }

            // 应急人员比例
            if (! empty($self['emergency_team_scale']) && $globalMax['emergency_team_scale'] > 0) {
                $logs['emergency_team_scale'] = $self['emergency_team_scale'] / $globalMax['emergency_team_scale'] * 0.0441225;
            }

            // 演练频次
            if (! empty($self['emergency_drill_scale']) && $globalMax['emergency_drill_scale'] > 0) {
                $logs['emergency_drill_scale'] = $self['emergency_drill_scale'] / $globalMax['emergency_drill_scale'] * 0.0441225;
            }

            // 特殊作业频次
            if (! empty($self['job_management_scale']) && $globalMax['job_management_scale'] > 0) {
                $logs['job_management_scale'] = (1 - $self['job_management_scale'] / $globalMax['job_management_scale']) * 0.228114;
            }

            // 风险源管理（待开发）
            $logs['risk_source_scale'] = 0;

            // 隐患整改率
            $invTotal = (int) $monthlyInvTotal->get($cid, 0);
            $invDone = (int) $monthlyInvDone->get($cid, 0);
            if ($invTotal > 0 && $invDone > 0) {
                $logs['monthly_investigation_scale'] = $invDone / $invTotal * 0.083752;
            }

            // 三同时及四新管理未完成比例
            $threeTotal = (int) $threeTotalCounts->get($cid, 0);
            $threeOver = (int) $threeOverCounts->get($cid, 0);
            if ($threeOver > 0 && $threeTotal > 0) {
                $logs['three_together_over_scale'] = $threeOver / $threeTotal * 0.048488;
            }

            // 资质情况
            $skillQual = (int) $skillUnitQualified->get($cid, 0);
            $skillTotal = (int) $skillUnitTotal->get($cid, 0);
            $evalQual = (int) $evalUnitQualified->get($cid, 0);
            $evalTotal = (int) $evalUnitTotal->get($cid, 0);
            $designQual = (int) $designUnitQualified->get($cid, 0);
            $designTotal = (int) $designUnitTotal->get($cid, 0);
            $unitSumQual = $skillQual + $evalQual + $designQual;
            $unitSumTotal = $skillTotal + $evalTotal + $designTotal;
            if ($unitSumQual > 0 && $unitSumTotal > 0) {
                $logs['unit_sum_number_scale'] = $unitSumQual / $unitSumTotal * 0.012509904;
            }

            // 安全协议
            $evalAgreement = (int) $evalUnitAgreement->get($cid, 0);
            if ($evalAgreement > 0 && $evalTotal > 0) {
                $logs['evaluation_unit_scale'] = $evalAgreement / $evalTotal * 0.00509124;
            }

            // 培训教育
            $evalTrained = (int) $evalUnitTrained->get($cid, 0);
            if ($evalTrained > 0 && $evalTotal > 0) {
                $logs['evaluation_unit_school_scale'] = $evalTrained / $evalTotal * 0.030886856;
            }

            // 体检覆盖率
            $healthCheckupPeople = (float) $healthCheckupSums->get($cid, 0);
            if ($healthCheckupPeople > 0 && $personnel && $personnel->total_people > 0) {
                $logs['health_checkup_people_scale'] = $healthCheckupPeople / $personnel->total_people * 0.009345;
            }

            // 职业病危害接触人数比例
            if (! empty($self['health_checkup_scale']) && $globalMax['health_checkup_scale'] > 0) {
                $logs['health_checkup_scale'] = (1 - $self['health_checkup_scale'] / $globalMax['health_checkup_scale']) * 0.022962;
            }

            // 是否有职业病报告（有报告加分）
            if ((int) $healthReportCounts->get($cid, 0) > 0) {
                $logs['health_report_scale'] = 0.056693;
            }

            // 计算浮动风险值
            $floatRisk = round(array_sum($logs) * 100, 2);
            $floatRiskGrade = $this->riskGrade($floatRisk);

            $floatLogRows[] = array_merge($logs, ['company_id' => $cid, 'created_at' => $now, 'updated_at' => $now]);
            $riskLogRows[] = [
                'company_id' => $cid,
                'type' => 2,
                'old_risk_num' => $company->float_risk,
                'risk_num' => $floatRisk,
                'date' => date('Ymd'),
                'content' => $content,
                'company_name' => $company->title,
                'old_risk_grade' => $company->float_risk_grade,
                'risk_grade' => $floatRiskGrade,
                'created_at' => $now,
                'updated_at' => $now,
            ];

            Company::where('id', $cid)->update(['float_risk' => $floatRisk, 'float_risk_grade' => $floatRiskGrade]);
        }

        foreach (array_chunk($floatLogRows, 500) as $chunk) {
            DB::table('float_risk_logs')->insert($chunk);
        }

        foreach (array_chunk($riskLogRows, 500) as $chunk) {
            DB::table('risk_logs')->insert($chunk);
        }

        // ── Phase 4: Bloc company averages ───────────────────────────────────
        $this->calculateBlocRisk($content);
    }

    /**
     * For each bloc company, calculate inherent_risk and float_risk
     * as the weighted average of all active descendant produce companies.
     */
    protected function calculateBlocRisk(string $content): void
    {
        $blocCompanies = Company::where('is_bloc', 1)->where('status', 1)->get();
        $now = now()->toDateTimeString();

        foreach ($blocCompanies as $bloc) {
            $descendantIds = [];
            $this->collectBlocDescendants($bloc->id, $descendantIds);

            if (empty($descendantIds)) {
                continue;
            }

            $produces = Company::whereIn('id', $descendantIds)
                ->where('is_produce', 1)
                ->where('status', 1)
                ->whereNotNull('inherent_risk')
                ->get();

            if ($produces->isEmpty()) {
                continue;
            }

            $count = $produces->count();
            $inherentAvg = round($produces->sum('inherent_risk') / $count, 2);
            $floatAvg = round($produces->sum('float_risk') / $count, 2);

            $inherentGrade = $this->riskGrade($inherentAvg);
            $floatGrade = $this->riskGrade($floatAvg);

            DB::table('risk_logs')->insert([
                [
                    'company_id' => $bloc->id, 'type' => 1,
                    'old_risk_num' => $bloc->inherent_risk, 'risk_num' => $inherentAvg,
                    'date' => date('Ymd'), 'content' => $content,
                    'company_name' => $bloc->title,
                    'old_risk_grade' => $bloc->inherent_risk_grade, 'risk_grade' => $inherentGrade,
                    'created_at' => $now, 'updated_at' => $now,
                ],
                [
                    'company_id' => $bloc->id, 'type' => 2,
                    'old_risk_num' => $bloc->float_risk, 'risk_num' => $floatAvg,
                    'date' => date('Ymd'), 'content' => $content,
                    'company_name' => $bloc->title,
                    'old_risk_grade' => $bloc->float_risk_grade, 'risk_grade' => $floatGrade,
                    'created_at' => $now, 'updated_at' => $now,
                ],
            ]);

            Company::where('id', $bloc->id)->update([
                'inherent_risk' => $inherentAvg,
                'inherent_risk_grade' => $inherentGrade,
                'float_risk' => $floatAvg,
                'float_risk_grade' => $floatGrade,
            ]);
        }
    }

    protected function riskGrade(float $value): string
    {
        if ($value < 5) {
            return '红';
        }

        if ($value < 10) {
            return '橙';
        }

        if ($value < 15) {
            return '黄';
        }

        return '蓝';
    }

    protected function collectBlocDescendants(int $companyId, array &$ids): void
    {
        $children = Company::where('pid', $companyId)->where('status', 1)->pluck('id');

        foreach ($children as $childId) {
            $ids[] = $childId;
            $this->collectBlocDescendants($childId, $ids);
        }
    }
}
