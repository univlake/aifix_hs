<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * 将 daily_checks.number 改为 decimal(8,1)，允许 0.5 这样的小数分值。
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('daily_checks', function (Blueprint $table) {
            $table->decimal('number', 8, 1)->default(0)->comment('得分')->change();
        });
    }

    public function down(): void
    {
        Schema::table('daily_checks', function (Blueprint $table) {
            $table->integer('number')->default(0)->comment('得分')->change();
        });
    }
};
