<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Normalize expert_companies datetime columns that were saved raw from the
 * browser's datetime-local input (e.g. `2026-04-21T09:55`) into MySQL's
 * `Y-m-d H:i:s` format. Otherwise string comparisons against NOW() pick the
 * wrong rows because 'T' (0x54) > ' ' (0x20).
 */
return new class extends Migration
{
    public function up(): void
    {
        $columns = ['notify_company_time', 'check_company_time', 'confirm_time'];

        foreach ($columns as $column) {
            DB::table('expert_companies')
                ->whereNotNull($column)
                ->where($column, 'like', '%T%')
                ->orderBy('id')
                ->chunkById(500, function ($rows) use ($column) {
                    foreach ($rows as $row) {
                        $raw = $row->{$column};

                        if (! is_string($raw) || $raw === '') {
                            continue;
                        }

                        try {
                            $normalized = Carbon::parse($raw)->format('Y-m-d H:i:s');
                        } catch (Throwable) {
                            continue;
                        }

                        DB::table('expert_companies')
                            ->where('id', $row->id)
                            ->update([$column => $normalized]);
                    }
                });
        }
    }

    public function down(): void
    {
        // No-op: normalization is irreversible and safe to keep.
    }
};
