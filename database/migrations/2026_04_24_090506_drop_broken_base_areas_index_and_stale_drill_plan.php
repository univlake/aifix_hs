<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Cleans up two pre-existing dev-DB artifacts that break SQLite schema edits:
 *
 * 1. `base_areas_deleted_at_index` was created by an earlier run of
 *    `add_performance_indexes` against a `base_areas` table that never had
 *    a `deleted_at` column (BaseArea doesn't use SoftDeletes). The dangling
 *    index references a non-existent column and blocks ALTER/DROP COLUMN
 *    globally on SQLite.
 *
 * 2. `emergency_drills.drill_plan` was added briefly, then removed from
 *    the codebase. The column may still exist in some dev databases.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('DROP INDEX IF EXISTS base_areas_deleted_at_index');
        }

        if (Schema::hasColumn('emergency_drills', 'drill_plan')) {
            Schema::table('emergency_drills', function (Blueprint $table) {
                $table->dropColumn('drill_plan');
            });
        }
    }

    public function down(): void
    {
        // Non-reversible: restoring a broken index or a removed column
        // serves no purpose.
    }
};
