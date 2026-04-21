<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Cleans up stray columns from the earlier (now no-op) migration in dev databases
     * where those columns were physically added. Tests start from a clean schema so
     * this is effectively a no-op there.
     */
    public function up(): void
    {
        if ($this->hasAnyStrayColumn()) {
            foreach (['hidden_danger_infos_archive_by_index'] as $idx) {
                try {
                    DB::statement("DROP INDEX IF EXISTS {$idx}");
                } catch (Throwable) {
                    // ignore
                }
            }
            foreach (['rectification_date', 'rectification_description', 'archive_by', 'archived_at'] as $col) {
                if (Schema::hasColumn('hidden_danger_infos', $col)) {
                    Schema::table('hidden_danger_infos', function (Blueprint $table) use ($col) {
                        $table->dropColumn($col);
                    });
                }
            }
        }
    }

    public function down(): void {}

    private function hasAnyStrayColumn(): bool
    {
        foreach (['rectification_date', 'rectification_description', 'archive_by', 'archived_at'] as $col) {
            if (Schema::hasColumn('hidden_danger_infos', $col)) {
                return true;
            }
        }

        return false;
    }
};
