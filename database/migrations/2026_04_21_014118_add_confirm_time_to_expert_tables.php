<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expert_companies', function (Blueprint $table) {
            $table->timestamp('confirm_time')->comment('企业确认时间')->nullable()->after('check_company_time');
        });

        Schema::table('expert_inspection_users', function (Blueprint $table) {
            $table->timestamp('confirm_time')->comment('专家确认时间')->nullable()->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('expert_companies', function (Blueprint $table) {
            $table->dropColumn('confirm_time');
        });

        Schema::table('expert_inspection_users', function (Blueprint $table) {
            $table->dropColumn('confirm_time');
        });
    }
};
