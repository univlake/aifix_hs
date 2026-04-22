<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds an explicit "notification sent" timestamp on ExpertInspectionUser so that
 * dashboard / plan listings only surface records after the planner explicitly
 * notifies the expert — mirrors expert_companies.notify_company_time.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expert_inspection_users', function (Blueprint $table) {
            $table->timestamp('notify_time')->nullable()->after('expert_company_id');
        });
    }

    public function down(): void
    {
        Schema::table('expert_inspection_users', function (Blueprint $table) {
            $table->dropColumn('notify_time');
        });
    }
};
