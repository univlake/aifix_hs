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
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

trait CalculateRiskValue
{
    /**
     * Industry weight multipliers, keyed by Company.enterprise_type_id (string).
     * Any unmatched id falls back to 1.0.
     *
     * @var array<string, float>
     */
    protected array $industryWeights = [
        '1' => 0.8,
        '2' => 0.6,
        '3' => 0.9,
    ];

    /**
     * Phase-2 (inherent risk) weight constants, named by metric.
     * These are the original magic numbers from the legacy implementation —
     * extracting them here makes the math auditable without changing it.
     */
    protected const INHERENT_WEIGHTS = [
        'safety_architecture_value' => 0.02496,
        'security_officer_scale' => 0.007345,
        'already_obtain_people_scale' => 0.007345,
        'last_year_income_scale' => 0.007345,
        'funding_execution_scale' => 0.007345,
        'production_standardization_max' => 0.002665,
        'health_system_scale' => 0.002665,
        'assess_detect_scale' => 0.00533,
        'high_school_diploma_scale' => 0.014235,
        'acreage_scale' => 0.007865,
        'staff_scale' => 0.007865,
        'safety_engineering_major_scale' => 0.035035,
        'hazardous_processes_scale' => 0.14775,
        'hazardous_process_scale' => 0.04925,
        'hazardous_process_more_scale' => 0.14775,
        'process_is_automatic_scale' => 0.04925,
        'special_equipment_number_scale' => 0.119,
        'equipment_more_number_scale' => 0.119,
        'hazardous_chemical_scale' => 0.158746,
        'hazardous_chemicals_number_scale' => 0.0594405,
        'major_hazard_max' => 0.0198135,
    ];

    /**
     * Phase-3 (float / dynamic risk) weight constants, named by metric.
     */
    protected const FLOAT_WEIGHTS = [
        'internal_meeting_scale' => 0.031635,
        'internal_training_scale' => 0.063365,
        'accident_bulletin_scale' => 0.10075035,
        'accident_bulletin_severe_max' => 0.058859415,
        'accident_report_url_scale' => 0.017145235,
        'emergency_team_scale' => 0.0441225,
        'emergency_drill_scale' => 0.0441225,
        'job_management_scale' => 0.228114,
        'monthly_investigation_scale' => 0.083752,
        'three_together_over_scale' => 0.048488,
        'unit_sum_number_scale' => 0.012509904,
        'evaluation_unit_scale' => 0.00509124,
        'evaluation_unit_school_scale' => 0.030886856,
        'health_checkup_people_scale' => 0.009345,
        'health_checkup_scale' => 0.022962,
        'health_report_scale' => 0.056693,
    ];

    /**
     * Per-company raw "Phase 1" metrics, keyed by company_id.
     * Populated by computePhase1Metrics(); consumed by phases 2 & 3 via $self lookups.
     *
     * @var array<int, array<string, float>>
     */
    protected array $riskMaxByCid = [];

    /**
     * Global per-metric maximum across all produce companies in this run.
     * Used to normalize per-company metrics into a 0..1 scale.
     *
     * @var array<string, float>
     */
    protected array $globalMax = [];

    /**
     * Bulk-loaded data tables, populated by loadBulkMetrics().
     *
     * @var array<string, mixed>
     */
    protected array $bulk = [];

    /**
     * Run a complete daily risk calculation pass for every active produce company,
     * then aggregate bloc averages.
     */
    public function countRisk(string $content): void
    {
        $companies = Company::where('is_produce', '1')->where('status', 1)->get();
        if ($companies->isEmpty()) {
            return;
        }

        $companyIds = $companies->pluck('id')->all();
        $now = now()->toDateTimeString();
        $today = date('Y-m-d');
        $currentYear = (int) date('Y');
        $tenYearsAgo = date('Y-m-d', strtotime('-10 years'));
        $startOfYear = $currentYear.'-01-01';
        $daysThisYear = max(1, (int) floor((time() - strtotime($startOfYear)) / 86400));

        $this->resetTodayLogs($today);
        $this->loadBulkMetrics($companyIds, $currentYear, $tenYearsAgo);

        $this->computePhase1Metrics($companies, $daysThisYear, $currentYear);

        $inherentRows = $this->computeInherentRisk($companies, $now, $content);
        $floatRows = $this->computeFloatRisk($companies, $now, $content);

        $this->bulkInsertChunked('inherent_risk_logs', $inherentRows['inherent_log_rows']);
        $this->bulkInsertChunked('float_risk_logs', $floatRows['float_log_rows']);
        $this->bulkInsertChunked('risk_logs', array_merge($inherentRows['risk_log_rows'], $floatRows['risk_log_rows']));

        $this->calculateBlocRisk($content, $now);
    }

    /**
     * Delete today's pending risk-log rows so a re-run produces a single fresh set.
     * Failures are logged but not fatal — the run still continues, and the inserts
     * below would fail loudly if the table was actually unwritable.
     */
    protected function resetTodayLogs(string $today): void
    {
        try {
            RiskLog::whereDate('created_at', $today)->delete();
            FloatRiskLog::whereDate('created_at', $today)->delete();
            InherentRiskLog::whereDate('created_at', $today)->delete();
        } catch (\Throwable $e) {
            Log::warning('CalculateRiskValue: reset of today\'s logs failed', [
                'error' => $e->getMessage(),
                'date' => $today,
            ]);
        }
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
            $cid = (int) $company->id;
            $personnel = $this->bulk['personnel']->get($cid);
            $row = ['company_id' => $cid];

            if ($personnel && $personnel->total_people > 0 && $personnel->security_officer > 0) {
                $row['security_officer_scale'] = $personnel->security_officer / $personnel->total_people;
            }

            $cert = $this->bulk['cert']->get($cid);
            if ($cert && $personnel && $cert->already_obtain_people > 0 && $personnel->security_officer > 0) {
                $row['already_obtain_people_scale'] = $cert->already_obtain_people / $personnel->security_officer;
            }

            $secInv = $this->bulk['sec_inv']->get($cid);
            if ($secInv && $secInv->budget_sum > 0 && $secInv->income_sum > 0) {
                $row['last_year_income_scale'] = $secInv->budget_sum / $secInv->income_sum * $secInv->cnt;
            }

            if ($personnel && $company->acreage > 0 && $personnel->total_people > 0) {
                $row['acreage_scale'] = $personnel->total_people / $company->acreage;
            }

            $totalHazProc = (int) $this->bulk['major_haz_proc_total']->get($cid, 0)
                + (int) $this->bulk['haz_proc_total']->get($cid, 0);
            if ($personnel && $totalHazProc > 0 && $personnel->total_people > 0) {
                $row['hazardous_processes_scale'] = $totalHazProc / $personnel->total_people;
            }

            $hazChemRow = $this->bulk['haz_chem_stats']->get($cid);
            $hazChemCount = $hazChemRow ? (int) $hazChemRow->total : 0;
            if ($personnel && $hazChemCount > 0 && $personnel->total_people > 0) {
                $row['hazardous_chemicals_scale'] = $hazChemCount / $personnel->total_people;
            }

            $meetingCount = (int) $this->bulk['internal_meeting_counts']->get($cid, 0);
            if ($meetingCount > 0) {
                $row['internal_meeting_scale'] = $meetingCount / $daysThisYear * 30;
            }

            $trainingCount = (int) $this->bulk['internal_training_counts']->get($cid, 0);
            if ($trainingCount > 0) {
                $row['internal_training_scale'] = $trainingCount / $daysThisYear * 30;
            }

            $accRow = $this->bulk['accident_stats']->get($cid);
            $accidentCount = $accRow ? (int) $accRow->total : 0;
            if ($accidentCount > 0) {
                $row['accident_bulletin_scale'] = $accidentCount / $daysThisYear * 365;
            }

            $teamSum = (float) $this->bulk['emergency_team_sums']->get($cid, 0);
            if ($personnel && $teamSum > 0 && $personnel->total_people > 0) {
                $row['emergency_team_scale'] = $teamSum / $personnel->total_people;
            }

            $drillCount = (int) $this->bulk['emergency_drill_counts']->get($cid, 0);
            $years = max(1, $currentYear - (int) date('Y', strtotime($company->created_at)));
            if ($drillCount > 0) {
                $row['emergency_drill_scale'] = $drillCount / $years;
            }

            $jobCount = (int) $this->bulk['job_management_counts']->get($cid, 0);
            if ($jobCount > 0) {
                $row['job_management_scale'] = $jobCount / $daysThisYear * 30;
            }

            $occHazSum = (float) $this->bulk['occupational_haz_sums']->get($cid, 0);
            if ($personnel && $occHazSum > 0 && $personnel->total_people > 0) {
                $row['health_checkup_scale'] = $occHazSum / $personnel->total_people;
            }

            $rows[] = $row;
            $byCid[$cid] = $row;
        }

        $maxKeys = [
            'security_officer_scale', 'already_obtain_people_scale', 'last_year_income_scale',
            'acreage_scale', 'hazardous_processes_scale', 'hazardous_chemicals_scale',
            'internal_meeting_scale', 'internal_training_scale', 'accident_bulletin_scale',
            'emergency_team_scale', 'emergency_drill_scale', 'job_management_scale',
            'health_checkup_scale',
        ];
        $max = array_fill_keys($maxKeys, 0.0);
        foreach ($rows as $row) {
            foreach ($maxKeys as $key) {
                $val = (float) ($row[$key] ?? 0);
                if ($val > $max[$key]) {
                    $max[$key] = $val;
                }
            }
        }

        $this->riskMaxByCid = $byCid;
        $this->globalMax = $max;
    }

    /**
     * Compute Phase 2 (inherent / structural) risk for every company. Updates
     * Company.inherent_risk + grade in batch.
     *
     * @param  Collection<int, Company>  $companies
     * @return array{inherent_log_rows: array<int, array<string, mixed>>, risk_log_rows: array<int, array<string, mixed>>}
     */
    protected function computeInherentRisk(Collection $companies, string $now, string $content): array
    {
        $inherentLogRows = [];
        $riskLogRows = [];
        $companyUpdates = [];

        foreach ($companies as $company) {
            $cid = (int) $company->id;
            $personnel = $this->bulk['personnel']->get($cid);
            $self = $this->riskMaxByCid[$cid] ?? [];
            $logs = [];

            $weights = $this->industryWeight((string) $company->enterprise_type_id);

            if ((int) $this->bulk['safety_arch_counts']->get($cid, 0) > 0) {
                $logs['safety_architecture_value'] = self::INHERENT_WEIGHTS['safety_architecture_value'];
            }

            $logs['security_officer_scale'] = $this->normalized($self, 'security_officer_scale')
                * self::INHERENT_WEIGHTS['security_officer_scale'];
            $logs['already_obtain_people_scale'] = $this->normalized($self, 'already_obtain_people_scale')
                * self::INHERENT_WEIGHTS['already_obtain_people_scale'];
            $logs['last_year_income_scale'] = $this->normalized($self, 'last_year_income_scale')
                * self::INHERENT_WEIGHTS['last_year_income_scale'];

            $fundingSum = (float) $this->bulk['funding_exec_sums']->get($cid, 0);
            $secInv = $this->bulk['sec_inv']->get($cid);
            $secInvBudget = $secInv ? (float) $secInv->budget_sum : 0.0;
            if ($fundingSum > 0 && $secInvBudget > 0) {
                $logs['funding_execution_scale'] = $fundingSum / $secInvBudget * self::INHERENT_WEIGHTS['funding_execution_scale'];
            }

            $prodStd = $this->bulk['production_std']->get($cid);
            if ($prodStd) {
                $logs['production_standardization_scale'] = match ($prodStd->grade) {
                    StandardizationGrade::Level1->value => 0.9 * 0.002665,
                    StandardizationGrade::Level2->value => 0.75 * 0.002665,
                    StandardizationGrade::Level3->value => 0.6 * 0.002665,
                    default => 0,
                };
            }

            if ($this->bulk['health_system']->has($cid)) {
                $logs['health_system_scale'] = self::INHERENT_WEIGHTS['health_system_scale'];
            }

            if ((int) $this->bulk['assess_detect_counts']->get($cid, 0) > 0) {
                $logs['assess_detect_scale'] = self::INHERENT_WEIGHTS['assess_detect_scale'];
            }

            if ($personnel && $personnel->high_school_diploma > 0 && $personnel->total_people > 0) {
                $logs['high_school_diploma_scale'] = $personnel->high_school_diploma / $personnel->total_people
                    * self::INHERENT_WEIGHTS['high_school_diploma_scale'];
            }

            $logs['acreage_scale'] = $this->normalized($self, 'acreage_scale')
                * self::INHERENT_WEIGHTS['acreage_scale'];

            if ($personnel && $personnel->staff > 0 && $personnel->total_people > 0) {
                $logs['staff_scale'] = $personnel->staff / $personnel->total_people * self::INHERENT_WEIGHTS['staff_scale'];
            }

            if ($personnel && $personnel->safety_engineering_major > 0 && $personnel->security_officer > 0) {
                $logs['safety_engineering_major_scale'] = $personnel->safety_engineering_major / $personnel->security_officer
                    * self::INHERENT_WEIGHTS['safety_engineering_major_scale'];
            }

            $logs['hazardous_processes_scale'] = $this->normalizedInverse($self, 'hazardous_processes_scale')
                * self::INHERENT_WEIGHTS['hazardous_processes_scale'];

            $majHazCount = (int) $this->bulk['major_haz_proc_total']->get($cid, 0);
            $hazProcCount = (int) $this->bulk['haz_proc_total']->get($cid, 0);
            $procSum = $majHazCount + $hazProcCount;
            if ($majHazCount > 0 && $procSum > 0) {
                $logs['hazardous_process_scale'] = (1 - $majHazCount / $procSum) * self::INHERENT_WEIGHTS['hazardous_process_scale'];
            }

            $majHazOver = (int) $this->bulk['major_haz_proc_over']->get($cid, 0);
            $hazProcOver = (int) $this->bulk['haz_proc_over']->get($cid, 0);
            $overSum = $majHazOver + $hazProcOver;
            if ($overSum > 0 && $procSum > 0) {
                $logs['hazardous_process_more_scale'] = (1 - $overSum / $procSum) * self::INHERENT_WEIGHTS['hazardous_process_more_scale'];
            }

            $hazProcAuto = (int) $this->bulk['haz_proc_auto']->get($cid, 0);
            if ($hazProcAuto > 0 && $procSum > 0) {
                $logs['process_is_automatic_scale'] = $hazProcAuto / $procSum * self::INHERENT_WEIGHTS['process_is_automatic_scale'];
            }

            $spEqCount = (int) $this->bulk['sp_eq_total']->get($cid, 0);
            $dangEqCount = (int) $this->bulk['dang_eq_total']->get($cid, 0);
            $eqSum = $spEqCount + $dangEqCount;
            if ($spEqCount > 0 && $eqSum > 0) {
                $logs['special_equipment_number_scale'] = (1 - $spEqCount / $eqSum) * self::INHERENT_WEIGHTS['special_equipment_number_scale'];
            }

            $spEqOldCount = (int) $this->bulk['sp_eq_old']->get($cid, 0);
            $dangEqOldCount = (int) $this->bulk['dang_eq_old']->get($cid, 0);
            $oldSum = $spEqOldCount + $dangEqOldCount;
            if ($oldSum > 0 && $eqSum > 0) {
                $logs['equipment_more_number_scale'] = (1 - $oldSum / $eqSum) * self::INHERENT_WEIGHTS['equipment_more_number_scale'];
            }

            $hazChemRow = $this->bulk['haz_chem_stats']->get($cid);
            $hazChemCount = $hazChemRow ? (int) $hazChemRow->total : 0;
            $hazChemDangerCount = $hazChemRow
                ? ((int) $hazChemRow->explosion_cnt + (int) $hazChemRow->toxin_gas_cnt
                    + (int) $hazChemRow->fire_a_cnt + (int) $hazChemRow->fire_b_cnt)
                : 0;
            if ($hazChemDangerCount > 0 && $hazChemCount > 0) {
                $logs['hazardous_chemical_scale'] = (1 - $hazChemDangerCount / $hazChemCount) * self::INHERENT_WEIGHTS['hazardous_chemical_scale'];
            }

            $logs['hazardous_chemicals_number_scale'] = $this->normalizedInverse($self, 'hazardous_chemicals_scale')
                * self::INHERENT_WEIGHTS['hazardous_chemicals_number_scale'];

            $levels = $this->bulk['major_hazard']->get($cid, collect())->pluck('level')->toArray();
            $logs['major_hazard_scale'] = match (true) {
                in_array(MajorHazardLevel::Level1->value, $levels) => 0.6 * 0.0198135,
                in_array(MajorHazardLevel::Level2->value, $levels) => 0.7 * 0.0198135,
                in_array(MajorHazardLevel::Level3->value, $levels) => 0.8 * 0.0198135,
                in_array(MajorHazardLevel::Level4->value, $levels) => 0.9 * 0.0198135,
                default => 1.0 * 0.0198135,
            };

            $inherentRisk = round(array_sum($logs) * $weights * 100, 2);
            $inherentGrade = $this->riskGrade($inherentRisk);

            $inherentLogRows[] = array_merge($logs, ['company_id' => $cid, 'created_at' => $now, 'updated_at' => $now]);
            $riskLogRows[] = $this->buildRiskLogRow(
                $company, type: 1, oldRisk: $company->inherent_risk, newRisk: $inherentRisk,
                oldGrade: $company->inherent_risk_grade, newGrade: $inherentGrade, content: $content, now: $now,
            );

            $companyUpdates[$cid] = ['inherent_risk' => $inherentRisk, 'inherent_risk_grade' => $inherentGrade];
        }

        $this->batchUpdateCompanies($companyUpdates);

        return ['inherent_log_rows' => $inherentLogRows, 'risk_log_rows' => $riskLogRows];
    }

    /**
     * Compute Phase 3 (float / dynamic) risk for every company. Updates
     * Company.float_risk + grade in batch.
     *
     * @param  Collection<int, Company>  $companies
     * @return array{float_log_rows: array<int, array<string, mixed>>, risk_log_rows: array<int, array<string, mixed>>}
     */
    protected function computeFloatRisk(Collection $companies, string $now, string $content): array
    {
        $floatLogRows = [];
        $riskLogRows = [];
        $companyUpdates = [];

        foreach ($companies as $company) {
            $cid = (int) $company->id;
            $personnel = $this->bulk['personnel']->get($cid);
            $self = $this->riskMaxByCid[$cid] ?? [];
            $logs = [];

            $logs['internal_meeting_scale'] = $this->normalized($self, 'internal_meeting_scale')
                * self::FLOAT_WEIGHTS['internal_meeting_scale'];
            $logs['internal_training_scale'] = $this->normalized($self, 'internal_training_scale')
                * self::FLOAT_WEIGHTS['internal_training_scale'];
            $logs['accident_bulletin_scale'] = $this->normalizedInverse($self, 'accident_bulletin_scale')
                * self::FLOAT_WEIGHTS['accident_bulletin_scale'];

            $accRow = $this->bulk['accident_stats']->get($cid);
            $lightCount = $accRow ? (int) $accRow->light_cnt : 0;
            $seriousCount = $accRow ? (int) $accRow->serious_cnt : 0;
            $otherCount = $accRow ? (int) $accRow->other_cnt : 0;
            $logs['accident_bulletin_severe_scale'] = match (true) {
                $otherCount > 0 => 0,
                $seriousCount > 0 => 0.3 * self::FLOAT_WEIGHTS['accident_bulletin_severe_max'],
                $lightCount > 0 => 0.6 * self::FLOAT_WEIGHTS['accident_bulletin_severe_max'],
                default => 1.0 * self::FLOAT_WEIGHTS['accident_bulletin_severe_max'],
            };

            $reportedCount = $accRow ? (int) $accRow->reported_cnt : 0;
            if ($reportedCount > 0) {
                $logs['accident_report_url_scale'] = self::FLOAT_WEIGHTS['accident_report_url_scale'];
            }

            $logs['emergency_team_scale'] = $this->normalized($self, 'emergency_team_scale')
                * self::FLOAT_WEIGHTS['emergency_team_scale'];
            $logs['emergency_drill_scale'] = $this->normalized($self, 'emergency_drill_scale')
                * self::FLOAT_WEIGHTS['emergency_drill_scale'];
            $logs['job_management_scale'] = $this->normalizedInverse($self, 'job_management_scale')
                * self::FLOAT_WEIGHTS['job_management_scale'];

            $logs['risk_source_scale'] = 0;

            $invTotal = (int) $this->bulk['monthly_inv_total']->get($cid, 0);
            $invDone = (int) $this->bulk['monthly_inv_done']->get($cid, 0);
            if ($invTotal > 0 && $invDone > 0) {
                $logs['monthly_investigation_scale'] = $invDone / $invTotal * self::FLOAT_WEIGHTS['monthly_investigation_scale'];
            }

            $threeTotal = (int) $this->bulk['three_total']->get($cid, 0);
            $threeOver = (int) $this->bulk['three_over']->get($cid, 0);
            if ($threeOver > 0 && $threeTotal > 0) {
                $logs['three_together_over_scale'] = $threeOver / $threeTotal * self::FLOAT_WEIGHTS['three_together_over_scale'];
            }

            $skillQual = (int) $this->bulk['skill_unit_qualified']->get($cid, 0);
            $skillTotal = (int) $this->bulk['skill_unit_total']->get($cid, 0);
            $evalQual = (int) $this->bulk['eval_unit_qualified']->get($cid, 0);
            $evalTotal = (int) $this->bulk['eval_unit_total']->get($cid, 0);
            $designQual = (int) $this->bulk['design_unit_qualified']->get($cid, 0);
            $designTotal = (int) $this->bulk['design_unit_total']->get($cid, 0);
            $unitSumQual = $skillQual + $evalQual + $designQual;
            $unitSumTotal = $skillTotal + $evalTotal + $designTotal;
            if ($unitSumQual > 0 && $unitSumTotal > 0) {
                $logs['unit_sum_number_scale'] = $unitSumQual / $unitSumTotal * self::FLOAT_WEIGHTS['unit_sum_number_scale'];
            }

            $evalAgreement = (int) $this->bulk['eval_unit_agreement']->get($cid, 0);
            if ($evalAgreement > 0 && $evalTotal > 0) {
                $logs['evaluation_unit_scale'] = $evalAgreement / $evalTotal * self::FLOAT_WEIGHTS['evaluation_unit_scale'];
            }

            $evalTrained = (int) $this->bulk['eval_unit_trained']->get($cid, 0);
            if ($evalTrained > 0 && $evalTotal > 0) {
                $logs['evaluation_unit_school_scale'] = $evalTrained / $evalTotal * self::FLOAT_WEIGHTS['evaluation_unit_school_scale'];
            }

            $healthCheckupPeople = (float) $this->bulk['health_checkup_sums']->get($cid, 0);
            if ($healthCheckupPeople > 0 && $personnel && $personnel->total_people > 0) {
                $logs['health_checkup_people_scale'] = $healthCheckupPeople / $personnel->total_people
                    * self::FLOAT_WEIGHTS['health_checkup_people_scale'];
            }

            $logs['health_checkup_scale'] = $this->normalizedInverse($self, 'health_checkup_scale')
                * self::FLOAT_WEIGHTS['health_checkup_scale'];

            if ((int) $this->bulk['health_report_counts']->get($cid, 0) > 0) {
                $logs['health_report_scale'] = self::FLOAT_WEIGHTS['health_report_scale'];
            }

            $floatRisk = round(array_sum($logs) * 100, 2);
            $floatGrade = $this->riskGrade($floatRisk);

            $floatLogRows[] = array_merge($logs, ['company_id' => $cid, 'created_at' => $now, 'updated_at' => $now]);
            $riskLogRows[] = $this->buildRiskLogRow(
                $company, type: 2, oldRisk: $company->float_risk, newRisk: $floatRisk,
                oldGrade: $company->float_risk_grade, newGrade: $floatGrade, content: $content, now: $now,
            );

            $companyUpdates[$cid] = ['float_risk' => $floatRisk, 'float_risk_grade' => $floatGrade];
        }

        $this->batchUpdateCompanies($companyUpdates);

        return ['float_log_rows' => $floatLogRows, 'risk_log_rows' => $riskLogRows];
    }

    /**
     * For each bloc company, calculate inherent_risk and float_risk
     * as the weighted average of all active descendant produce companies.
     */
    protected function calculateBlocRisk(string $content, ?string $now = null): void
    {
        $now ??= now()->toDateTimeString();
        $blocCompanies = Company::where('is_bloc', 1)->where('status', 1)->get();
        if ($blocCompanies->isEmpty()) {
            return;
        }

        $companyTree = $this->loadCompanyTree();
        $blocRiskLogRows = [];
        $blocCompanyUpdates = [];

        foreach ($blocCompanies as $bloc) {
            $descendantIds = $this->descendantsOf((int) $bloc->id, $companyTree);
            if (empty($descendantIds)) {
                continue;
            }

            $produces = Company::whereIn('id', $descendantIds)
                ->where('is_produce', 1)->where('status', 1)
                ->whereNotNull('inherent_risk')->get();
            if ($produces->isEmpty()) {
                continue;
            }

            $count = $produces->count();
            $inherentAvg = round($produces->sum('inherent_risk') / $count, 2);
            $floatAvg = round($produces->sum('float_risk') / $count, 2);
            $inherentGrade = $this->riskGrade($inherentAvg);
            $floatGrade = $this->riskGrade($floatAvg);

            $blocRiskLogRows[] = $this->buildRiskLogRow(
                $bloc, type: 1, oldRisk: $bloc->inherent_risk, newRisk: $inherentAvg,
                oldGrade: $bloc->inherent_risk_grade, newGrade: $inherentGrade, content: $content, now: $now,
            );
            $blocRiskLogRows[] = $this->buildRiskLogRow(
                $bloc, type: 2, oldRisk: $bloc->float_risk, newRisk: $floatAvg,
                oldGrade: $bloc->float_risk_grade, newGrade: $floatGrade, content: $content, now: $now,
            );

            $blocCompanyUpdates[(int) $bloc->id] = [
                'inherent_risk' => $inherentAvg,
                'inherent_risk_grade' => $inherentGrade,
                'float_risk' => $floatAvg,
                'float_risk_grade' => $floatGrade,
            ];
        }

        $this->bulkInsertChunked('risk_logs', $blocRiskLogRows);
        $this->batchUpdateCompanies($blocCompanyUpdates);
    }

    /**
     * Map every active company's id → list of direct child ids in a single query.
     * Replaces the legacy recursive Company::where('pid', ...) which issued
     * one query per descendant level per bloc.
     *
     * @return array<int, array<int>>
     */
    protected function loadCompanyTree(): array
    {
        $tree = [];
        Company::where('status', 1)
            ->select('id', 'pid')
            ->orderBy('id')
            ->chunk(1000, function ($companies) use (&$tree) {
                foreach ($companies as $c) {
                    $pid = (int) $c->pid;
                    if ($pid > 0) {
                        $tree[$pid][] = (int) $c->id;
                    }
                }
            });

        return $tree;
    }

    /**
     * Resolve all descendant ids of $companyId from a pre-loaded parent→children map.
     *
     * @param  array<int, array<int>>  $tree
     * @return array<int>
     */
    protected function descendantsOf(int $companyId, array $tree): array
    {
        $stack = $tree[$companyId] ?? [];
        $out = [];
        while (! empty($stack)) {
            $id = array_pop($stack);
            $out[] = $id;
            if (! empty($tree[$id])) {
                foreach ($tree[$id] as $child) {
                    $stack[] = $child;
                }
            }
        }

        return $out;
    }

    /**
     * Apply a per-company update map ([id => attrs]) using a single
     * `CASE WHEN id THEN val END` query per attribute, instead of N round-trips.
     *
     * @param  array<int, array<string, mixed>>  $updates
     */
    protected function batchUpdateCompanies(array $updates): void
    {
        if (empty($updates)) {
            return;
        }

        $ids = array_keys($updates);
        $attrs = array_keys(reset($updates));

        DB::transaction(function () use ($updates, $ids, $attrs) {
            foreach ($attrs as $attr) {
                $caseSegments = [];
                $bindings = [];
                foreach ($updates as $id => $values) {
                    $caseSegments[] = 'WHEN ? THEN ?';
                    $bindings[] = $id;
                    $bindings[] = $values[$attr];
                }
                $idsList = implode(',', array_map('intval', $ids));
                $sql = "UPDATE companies SET `{$attr}` = CASE id ".implode(' ', $caseSegments)
                    ." END WHERE id IN ({$idsList})";
                DB::statement($sql, $bindings);
            }
        });
    }

    /**
     * Insert rows into a table in chunks of $chunkSize. Skips when empty.
     *
     * @param  array<int, array<string, mixed>>  $rows
     */
    protected function bulkInsertChunked(string $table, array $rows, int $chunkSize = 500): void
    {
        if (empty($rows)) {
            return;
        }
        foreach (array_chunk($rows, $chunkSize) as $chunk) {
            DB::table($table)->insert($chunk);
        }
    }

    /**
     * Per-company normalized metric: $self[$key] / globalMax[$key], or 0 if either side is 0.
     *
     * @param  array<string, float>  $self
     */
    protected function normalized(array $self, string $key): float
    {
        $val = (float) ($self[$key] ?? 0);
        $max = $this->globalMax[$key] ?? 0;
        if ($val <= 0 || $max <= 0) {
            return 0.0;
        }

        return $val / $max;
    }

    /**
     * Per-company inverted normalized metric: 1 - (val/max), or 0 if either side is 0.
     * Used for "more is worse" metrics where a higher raw value should *reduce* the contribution.
     *
     * @param  array<string, float>  $self
     */
    protected function normalizedInverse(array $self, string $key): float
    {
        $val = (float) ($self[$key] ?? 0);
        $max = $this->globalMax[$key] ?? 0;
        if ($val <= 0 || $max <= 0) {
            return 0.0;
        }

        return 1 - ($val / $max);
    }

    protected function industryWeight(string $enterpriseTypeId): float
    {
        return $this->industryWeights[$enterpriseTypeId] ?? 1.0;
    }

    /**
     * @return array<string, mixed>
     */
    protected function buildRiskLogRow(
        Company $company,
        int $type,
        ?float $oldRisk,
        float $newRisk,
        ?string $oldGrade,
        string $newGrade,
        string $content,
        string $now,
    ): array {
        return [
            'company_id' => (int) $company->id,
            'type' => $type,
            'old_risk_num' => $oldRisk,
            'risk_num' => $newRisk,
            'date' => date('Ymd'),
            'content' => $content,
            'company_name' => $company->title,
            'old_risk_grade' => $oldGrade,
            'risk_grade' => $newGrade,
            'created_at' => $now,
            'updated_at' => $now,
        ];
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
}
