<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add deleted_at indexes to all tables with soft deletes, and composite
 * (company_id, deleted_at) indexes on high-traffic business tables.
 *
 * Why: Soft-delete queries always filter on `deleted_at IS NULL`.
 * Without an index, MySQL performs a full table scan on every query.
 * Composite indexes eliminate the second lookup when company_id is also filtered.
 */
return new class extends Migration
{
    /**
     * Tables that only need a basic deleted_at index (no company_id filter).
     *
     * @var array<string>
     */
    private array $softDeleteOnlyTables = [
        'companies',
        'users',
        'personnels',
        'enterprise_types',
        'operational_types',
        'record_types',
        'company_groups',
        'company_group_kids',
        'dangerous_craft_types',
        'process_types',
        'special_types',
        'space_work_types',
        'safety_management_types',
        'regulation_library_types',
        'checklist_libraries',
        'accident_bulletins',
        'accident_bulletin_kids',
        'information_drafts',
        'expert_inspections',
        'expert_companies',
        'expert_inspection_users',
        'month_statistics',
        'month_statistic_accidents',
        'month_statistic_controls',
        'year_statistics',
        'year_statistic_kids',
        'bloc_expert_users',
        'focus_companies',
        'daily_check_templates',
        'daily_checks',
        'double_check_templates',
        'double_checks',
        'system_checks',
        'norm_checks',
        'accident_check_templates',
        'accident_checks',
        'add_points_templates',
        'add_points',
    ];

    /**
     * Tables that need a composite (company_id, deleted_at) index.
     * These are the main business record tables — nearly every query
     * filters by both company and soft-delete state.
     *
     * @var array<string>
     */
    private array $companyTables = [
        'buildings',
        'job_management',
        'safety_architectures',
        'production_standardizations',
        'safety_management',
        'certificate_statuses',
        'elimination_control_staff',
        'skill_units',
        'skill_unit_kids',
        'design_units',
        'evaluation_units',
        'change_manages',
        'filing_permissions',
        'special_equipment',
        'special_equipment_staff',
        'dangerous_equipment',
        'hazardous_chemicals',
        'chemical_ingredients',
        'hazardous_processes',
        'major_hazards',
        'major_constitutes',
        'major_hazardous_processes',
        'space_works',
        'occupational_hazards',
        'health_systems',
        'health_files',
        'health_reports',
        'health_checkups',
        'hygiene_evaluations',
        'fire_safeties',
        'fire_equipment',
        'fire_facilities',
        'emergency_drills',
        'emergency_supplies',
        'emergency_teams',
        'emergency_team_kids',
        'three_togethers',
        'internal_trainings',
        'external_trainings',
        'other_trainings',
        'training_files',
        'training_file_logs',
        'training_videos',
        'training_video_logs',
        'meetings',
        'meeting_notices',
        'meeting_sign_ups',
        'internal_meetings',
        'internal_meeting_kids',
        'office_notifies',
        'office_notify_scopes',
        'new_notifies',
        'new_notify_scopes',
        'security_investments',
        'funding_executions',
        'assess_detects',
        'hidden_danger_infos',
        'hidden_upload_annexes',
        'rectification_sheets',
        'hazards',
        'risk_logs',
        'inherent_risk_logs',
        'float_risk_logs',
        'risk_max_values',
        'risk_distribution_maps',
        'monthly_investigations',
        'monthly_investigation_reviews',
        'monthly_investigation_views',
        'regulation_libraries',
    ];

    public function up(): void
    {
        foreach ($this->softDeleteOnlyTables as $tableName) {
            if (
                Schema::hasTable($tableName)
                && Schema::hasColumn($tableName, 'deleted_at')
                && ! $this->hasIndex($tableName, "{$tableName}_deleted_at_index")
            ) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->index('deleted_at');
                });
            }
        }

        foreach ($this->companyTables as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            $hasCompanyId = Schema::hasColumn($tableName, 'company_id');
            $hasDeletedAt = Schema::hasColumn($tableName, 'deleted_at');

            if (! $hasDeletedAt) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName, $hasCompanyId) {
                $compositeKey = "{$tableName}_company_id_deleted_at_index";
                $simpleKey = "{$tableName}_deleted_at_index";

                if ($hasCompanyId && ! $this->hasIndex($tableName, $compositeKey)) {
                    $table->index(['company_id', 'deleted_at'], $compositeKey);
                } elseif (! $hasCompanyId && ! $this->hasIndex($tableName, $simpleKey)) {
                    $table->index('deleted_at');
                }
            });
        }
    }

    public function down(): void
    {
        foreach ($this->softDeleteOnlyTables as $tableName) {
            if (Schema::hasTable($tableName) && $this->hasIndex($tableName, "{$tableName}_deleted_at_index")) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->dropIndex(['deleted_at']);
                });
            }
        }

        foreach ($this->companyTables as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName) {
                $compositeKey = "{$tableName}_company_id_deleted_at_index";
                $simpleKey = "{$tableName}_deleted_at_index";

                if ($this->hasIndex($tableName, $compositeKey)) {
                    $table->dropIndex($compositeKey);
                } elseif ($this->hasIndex($tableName, $simpleKey)) {
                    $table->dropIndex($simpleKey);
                }
            });
        }
    }

    private function hasIndex(string $table, string $indexName): bool
    {
        foreach (Schema::getIndexes($table) as $index) {
            if ($index['name'] === $indexName) {
                return true;
            }
        }

        return false;
    }
};
