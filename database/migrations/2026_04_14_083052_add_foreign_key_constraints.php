<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Add foreign key constraints to tables that reference companies, users, and other parent tables.
 *
 * Why: Without FK constraints, the database allows orphaned records (e.g., a building that
 * references a deleted company_id that never existed). This leads to data integrity violations
 * that surface as silent bugs or broken API responses.
 *
 * Note: This migration runs only on MySQL/MariaDB. SQLite has limited ALTER TABLE support and
 * cannot add foreign keys to existing tables without recreating them. Local dev uses SQLite;
 * production uses MySQL — this migration enforces integrity only where it matters.
 */
return new class extends Migration
{
    /**
     * Tables referencing companies.id with cascadeOnDelete.
     * If a company is deleted, its child records should also be removed.
     *
     * @var array<string>
     */
    private array $companyFkTables = [
        'personnels',
        'buildings',
        'job_management',
        'safety_architectures',
        'production_standardizations',
        'safety_management',
        'certificate_statuses',
        'elimination_control_staff',
        'skill_units',
        'design_units',
        'evaluation_units',
        'change_manages',
        'filing_permissions',
        'special_equipment',
        'special_equipment_staff',
        'dangerous_equipment',
        'hazardous_chemicals',
        'hazardous_processes',
        'major_hazards',
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
        'internal_trainings',
        'external_trainings',
        'other_trainings',
        'training_files',
        'training_videos',
        'training_classes',
        'meetings',
        'internal_meetings',
        'office_notifies',
        'new_notifies',
        'security_investments',
        'funding_executions',
        'assess_detects',
        'hidden_danger_infos',
        'rectification_sheets',
        'hazards',
        'risk_logs',
        'inherent_risk_logs',
        'float_risk_logs',
        'risk_max_values',
        'risk_distribution_maps',
        'monthly_investigations',
        'regulation_libraries',
        'expert_inspections',
        'accident_bulletins',
        'information_drafts',
        'month_statistics',
        'year_statistics',
    ];

    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        Schema::disableForeignKeyConstraints();

        // FK: company_id → companies.id
        foreach ($this->companyFkTables as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            if (! Schema::hasColumn($tableName, 'company_id')) {
                continue;
            }

            $fkName = "{$tableName}_company_id_foreign";

            if ($this->hasForeignKey($tableName, $fkName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) {
                $table->foreign('company_id')
                    ->references('id')
                    ->on('companies')
                    ->cascadeOnDelete();
            });
        }

        // FK: users.company_id → companies.id
        if (Schema::hasTable('users') && ! $this->hasForeignKey('users', 'users_company_id_foreign')) {
            Schema::table('users', function (Blueprint $table) {
                $table->foreign('company_id')
                    ->references('id')
                    ->on('companies')
                    ->nullOnDelete();
            });
        }

        // FK: companies.pid → companies.id (self-referential hierarchy)
        if (Schema::hasTable('companies') && ! $this->hasForeignKey('companies', 'companies_pid_foreign')) {
            Schema::table('companies', function (Blueprint $table) {
                $table->foreign('pid')
                    ->references('id')
                    ->on('companies')
                    ->nullOnDelete();
            });
        }

        // FK: skill_unit_kids.skill_unit_id → skill_units.id
        if (Schema::hasTable('skill_unit_kids') && ! $this->hasForeignKey('skill_unit_kids', 'skill_unit_kids_skill_unit_id_foreign')) {
            Schema::table('skill_unit_kids', function (Blueprint $table) {
                $table->foreign('skill_unit_id')
                    ->references('id')
                    ->on('skill_units')
                    ->cascadeOnDelete();
            });
        }

        // FK: major_constitutes.major_hazard_id → major_hazards.id
        if (Schema::hasTable('major_constitutes') && ! $this->hasForeignKey('major_constitutes', 'major_constitutes_major_hazard_id_foreign')) {
            Schema::table('major_constitutes', function (Blueprint $table) {
                $table->foreign('major_hazard_id')
                    ->references('id')
                    ->on('major_hazards')
                    ->cascadeOnDelete();
            });
        }

        // FK: expert_companies.expert_inspection_id → expert_inspections.id
        if (Schema::hasTable('expert_companies') && ! $this->hasForeignKey('expert_companies', 'expert_companies_expert_inspection_id_foreign')) {
            Schema::table('expert_companies', function (Blueprint $table) {
                $table->foreign('expert_inspection_id')
                    ->references('id')
                    ->on('expert_inspections')
                    ->cascadeOnDelete();
            });
        }

        // FK: emergency_team_kids.emergency_team_id → emergency_teams.id
        if (Schema::hasTable('emergency_team_kids') && ! $this->hasForeignKey('emergency_team_kids', 'emergency_team_kids_emergency_team_id_foreign')) {
            Schema::table('emergency_team_kids', function (Blueprint $table) {
                $table->foreign('emergency_team_id')
                    ->references('id')
                    ->on('emergency_teams')
                    ->cascadeOnDelete();
            });
        }

        // FK: accident_bulletin_kids.accident_bulletin_id → accident_bulletins.id
        if (Schema::hasTable('accident_bulletin_kids') && ! $this->hasForeignKey('accident_bulletin_kids', 'accident_bulletin_kids_accident_bulletin_id_foreign')) {
            Schema::table('accident_bulletin_kids', function (Blueprint $table) {
                $table->foreign('accident_bulletin_id')
                    ->references('id')
                    ->on('accident_bulletins')
                    ->cascadeOnDelete();
            });
        }

        // FK: year_statistic_kids.year_statistic_id → year_statistics.id
        if (Schema::hasTable('year_statistic_kids') && ! $this->hasForeignKey('year_statistic_kids', 'year_statistic_kids_year_statistic_id_foreign')) {
            Schema::table('year_statistic_kids', function (Blueprint $table) {
                $table->foreign('year_statistic_id')
                    ->references('id')
                    ->on('year_statistics')
                    ->cascadeOnDelete();
            });
        }

        // FK: monthly_investigation_reviews.monthly_investigation_id
        if (Schema::hasTable('monthly_investigation_reviews') && ! $this->hasForeignKey('monthly_investigation_reviews', 'monthly_investigation_reviews_monthly_investigation_id_foreign')) {
            Schema::table('monthly_investigation_reviews', function (Blueprint $table) {
                $table->foreign('monthly_investigation_id')
                    ->references('id')
                    ->on('monthly_investigations')
                    ->cascadeOnDelete();
            });
        }

        // FK: monthly_investigation_views.monthly_investigation_id
        if (Schema::hasTable('monthly_investigation_views') && ! $this->hasForeignKey('monthly_investigation_views', 'monthly_investigation_views_monthly_investigation_id_foreign')) {
            Schema::table('monthly_investigation_views', function (Blueprint $table) {
                $table->foreign('monthly_investigation_id')
                    ->references('id')
                    ->on('monthly_investigations')
                    ->cascadeOnDelete();
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

        foreach ($this->companyFkTables as $tableName) {
            if (Schema::hasTable($tableName) && $this->hasForeignKey($tableName, "{$tableName}_company_id_foreign")) {
                Schema::table($tableName, fn (Blueprint $t) => $t->dropForeign(['company_id']));
            }
        }

        $otherFks = [
            'users' => 'users_company_id_foreign',
            'companies' => 'companies_pid_foreign',
            'skill_unit_kids' => 'skill_unit_kids_skill_unit_id_foreign',
            'major_constitutes' => 'major_constitutes_major_hazard_id_foreign',
            'expert_companies' => 'expert_companies_expert_inspection_id_foreign',
            'emergency_team_kids' => 'emergency_team_kids_emergency_team_id_foreign',
            'accident_bulletin_kids' => 'accident_bulletin_kids_accident_bulletin_id_foreign',
            'year_statistic_kids' => 'year_statistic_kids_year_statistic_id_foreign',
            'monthly_investigation_reviews' => 'monthly_investigation_reviews_monthly_investigation_id_foreign',
            'monthly_investigation_views' => 'monthly_investigation_views_monthly_investigation_id_foreign',
        ];

        foreach ($otherFks as $tableName => $fkName) {
            if (Schema::hasTable($tableName) && $this->hasForeignKey($tableName, $fkName)) {
                Schema::table($tableName, fn (Blueprint $t) => $t->dropForeign([$fkName]));
            }
        }

        Schema::enableForeignKeyConstraints();
    }

    private function hasForeignKey(string $table, string $fkName): bool
    {
        foreach (Schema::getForeignKeys($table) as $fk) {
            if ($fk['name'] === $fkName) {
                return true;
            }
        }

        return false;
    }
};
