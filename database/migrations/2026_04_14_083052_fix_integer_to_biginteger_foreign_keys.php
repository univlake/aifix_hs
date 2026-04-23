<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Fix integer vs bigInteger type mismatch on foreign key columns.
 *
 * Why: Primary keys use $table->id() which creates an UNSIGNED BIGINT column.
 * Foreign key columns referencing these PKs use unsignedInteger() which is only
 * 4 bytes (max 4,294,967,295). On MySQL, this causes a type mismatch error when
 * adding foreign key constraints, and will silently truncate IDs > 4B rows.
 *
 * This migration changes all FK columns from unsignedInteger → unsignedBigInteger
 * to match the referenced primary key type.
 *
 * Note: MySQL-only. SQLite does not support column modification without recreating
 * the table. Local dev uses SQLite; this runs only in production (MySQL).
 *
 * @var array<string, array<string>> Table name → list of FK columns to upgrade
 */
return new class extends Migration
{
    /**
     * @var array<string, array<string>>
     */
    private array $tables = [
        'companies' => ['enterprise_type_id', 'operational_type_id', 'area_id', 'pid', 'user_id', 'last_user_id'],
        'personnels' => ['company_id', 'user_id', 'last_user_id'],
        'users' => ['company_id', 'user_id', 'last_user_id', 'role_id'],
        'buildings' => ['company_id', 'user_id', 'last_user_id'],
        'job_management' => ['company_id', 'user_id', 'last_user_id'],
        'safety_architectures' => ['company_id', 'user_id', 'last_user_id'],
        'production_standardizations' => ['company_id', 'user_id', 'last_user_id'],
        'safety_management' => ['company_id', 'user_id', 'last_user_id'],
        'certificate_statuses' => ['company_id', 'user_id', 'last_user_id'],
        'elimination_control_staff' => ['company_id', 'user_id', 'last_user_id'],
        'skill_units' => ['company_id', 'user_id', 'last_user_id'],
        'skill_unit_kids' => ['company_id', 'skill_unit_id', 'user_id', 'last_user_id'],
        'design_units' => ['company_id', 'user_id', 'last_user_id'],
        'evaluation_units' => ['company_id', 'user_id', 'last_user_id'],
        'change_manages' => ['company_id', 'user_id', 'last_user_id'],
        'filing_permissions' => ['company_id', 'user_id', 'last_user_id'],
        'special_equipment' => ['company_id', 'special_type_id', 'user_id', 'last_user_id'],
        'special_equipment_staff' => ['company_id', 'user_id', 'last_user_id'],
        'dangerous_equipment' => ['company_id', 'user_id', 'last_user_id'],
        'hazardous_chemicals' => ['company_id', 'user_id', 'last_user_id'],
        'chemical_ingredients' => ['company_id', 'hazardous_chemical_id', 'user_id', 'last_user_id'],
        'hazardous_processes' => ['company_id', 'user_id', 'last_user_id'],
        'major_hazards' => ['company_id', 'user_id', 'last_user_id'],
        'major_constitutes' => ['company_id', 'major_hazard_id', 'user_id', 'last_user_id'],
        'major_hazardous_processes' => ['company_id', 'user_id', 'last_user_id'],
        'space_works' => ['company_id', 'space_work_type_id', 'user_id', 'last_user_id'],
        'occupational_hazards' => ['company_id', 'user_id', 'last_user_id'],
        'health_systems' => ['company_id', 'user_id', 'last_user_id'],
        'health_files' => ['company_id', 'user_id', 'last_user_id'],
        'health_reports' => ['company_id', 'user_id', 'last_user_id'],
        'health_checkups' => ['company_id', 'user_id', 'last_user_id'],
        'hygiene_evaluations' => ['company_id', 'user_id', 'last_user_id'],
        'expert_inspections' => ['company_id', 'user_id', 'last_user_id'],
        'expert_companies' => ['expert_inspection_id', 'check_company_id', 'user_id', 'last_user_id'],
        'expert_inspection_users' => ['expert_inspection_id', 'user_id'],
        'accident_bulletins' => ['company_id', 'user_id', 'last_user_id'],
        'accident_bulletin_kids' => ['accident_bulletin_id', 'company_id', 'user_id', 'last_user_id'],
        'information_drafts' => ['company_id', 'user_id', 'last_user_id'],
        'month_statistics' => ['company_id', 'user_id', 'last_user_id'],
        'month_statistic_accidents' => ['month_statistic_id', 'company_id', 'user_id', 'last_user_id'],
        'month_statistic_controls' => ['month_statistic_id', 'company_id', 'user_id', 'last_user_id'],
        'year_statistics' => ['company_id', 'user_id', 'last_user_id'],
        'year_statistic_kids' => ['year_statistic_id', 'company_id', 'user_id', 'last_user_id'],
        'fire_safeties' => ['company_id', 'user_id', 'last_user_id'],
        'fire_equipment' => ['company_id', 'user_id', 'last_user_id'],
        'fire_facilities' => ['company_id', 'user_id', 'last_user_id'],
        'emergency_drills' => ['company_id', 'user_id', 'last_user_id'],
        'emergency_supplies' => ['company_id', 'user_id', 'last_user_id'],
        'emergency_teams' => ['company_id', 'user_id', 'last_user_id'],
        'emergency_team_kids' => ['company_id', 'emergency_team_id', 'user_id', 'last_user_id'],
        'three_togethers' => ['company_id', 'user_id', 'last_user_id'],
        'internal_trainings' => ['company_id', 'user_id', 'last_user_id'],
        'external_trainings' => ['company_id', 'user_id', 'last_user_id'],
        'other_trainings' => ['company_id', 'user_id', 'last_user_id'],
        'training_files' => ['company_id', 'user_id', 'last_user_id'],
        'training_videos' => ['company_id', 'user_id', 'last_user_id'],
        'meetings' => ['company_id', 'user_id', 'last_user_id'],
        'internal_meetings' => ['company_id', 'user_id', 'last_user_id'],
        'office_notifies' => ['company_id', 'user_id', 'last_user_id'],
        'new_notifies' => ['company_id', 'user_id', 'last_user_id'],
        'security_investments' => ['company_id', 'user_id', 'last_user_id'],
        'funding_executions' => ['company_id', 'user_id', 'last_user_id'],
        'assess_detects' => ['company_id', 'user_id', 'last_user_id'],
        'hidden_danger_infos' => ['company_id', 'user_id', 'last_user_id'],
        'rectification_sheets' => ['company_id', 'user_id', 'last_user_id'],
        'hazards' => ['company_id', 'user_id', 'last_user_id'],
        'risk_logs' => ['company_id', 'hazard_id', 'user_id', 'last_user_id'],
        'inherent_risk_logs' => ['company_id', 'hazard_id', 'user_id', 'last_user_id'],
        'float_risk_logs' => ['company_id', 'hazard_id', 'user_id', 'last_user_id'],
        'risk_max_values' => ['company_id', 'user_id', 'last_user_id'],
        'risk_distribution_maps' => ['company_id', 'user_id', 'last_user_id'],
        'monthly_investigations' => ['company_id', 'user_id', 'last_user_id'],
        'monthly_investigation_reviews' => ['monthly_investigation_id', 'user_id', 'last_user_id'],
        'monthly_investigation_views' => ['monthly_investigation_id', 'user_id'],
        'regulation_libraries' => ['company_id', 'regulation_library_type_id', 'user_id', 'last_user_id'],
        'focus_companies' => ['company_id', 'focus_company_id', 'user_id'],
        'bloc_expert_users' => ['company_id', 'user_id'],
    ];

    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        Schema::disableForeignKeyConstraints();

        foreach ($this->tables as $tableName => $columns) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName, $columns) {
                foreach ($columns as $column) {
                    if (Schema::hasColumn($tableName, $column)) {
                        $table->unsignedBigInteger($column)->nullable()->change();
                    }
                }
            });
        }

        Schema::enableForeignKeyConstraints();
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        Schema::disableForeignKeyConstraints();

        foreach ($this->tables as $tableName => $columns) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName, $columns) {
                foreach ($columns as $column) {
                    if (Schema::hasColumn($tableName, $column)) {
                        $table->unsignedInteger($column)->nullable()->change();
                    }
                }
            });
        }

        Schema::enableForeignKeyConstraints();
    }
};
