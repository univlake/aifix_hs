<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_check_templates', function (Blueprint $table) {
            $table->id();
            $table->text('title')->comment('指标描述');
            $table->integer('level')->comment('指标等级')->default(1);
            $table->integer('sort')->comment('排序')->default(0);
            $table->integer('year')->comment('年')->default(2022);
            $table->integer('pid')->comment('所属指标')->default(0);
            $table->string('score_range')->comment('分指范围')->default('1');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_check_templates');
    }
};
