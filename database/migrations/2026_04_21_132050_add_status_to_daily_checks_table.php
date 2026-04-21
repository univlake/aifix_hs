<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * 新增 daily_checks.status：填报状态。
 *   0 = 填报中 (可继续填报、删除)
 *   1 = 已完成填报 (上级可评分)
 *   2 = 已评分 (流程结束)
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('daily_checks', function (Blueprint $table) {
            $table->tinyInteger('status')->default(0)->index()->after('comment');
        });
    }

    public function down(): void
    {
        Schema::table('daily_checks', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropColumn('status');
        });
    }
};
