<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('expert_companies', function (Blueprint $table) {
            $table->string('rectification_sheet_url')->nullable()->after('inspection_notice_url');
        });
    }

    public function down(): void
    {
        Schema::table('expert_companies', function (Blueprint $table) {
            $table->dropColumn('rectification_sheet_url');
        });
    }
};
