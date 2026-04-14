<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skill_units', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('单位名称');
            $table->string('serving_type')->comment('服务类型');
            $table->integer('is_qualification')->default(2)->comment('资质情况1有2无');
            $table->text('evaluation_area')->nullable()->comment('施工范围');
            $table->string('contact')->nullable()->comment('联系人');
            $table->string('contact_tel')->nullable()->comment('联系电话');
            $table->integer('company_id')->required()->index();
            $table->integer('user_id')->default(0)->index();
            $table->integer('last_user_id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('skill_units');
    }
};
