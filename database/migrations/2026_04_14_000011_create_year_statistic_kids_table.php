<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('year_statistic_kids', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('名称')->nullable();
            $table->integer('type')->comment('类型')->default(1);
            $table->integer('should_obtain_people')->comment('应取证人数')->nullable();
            $table->integer('already_obtain_people')->comment('已取证人数')->nullable();
            $table->string('no_obtain_people')->comment('未取证人数说明')->nullable();
            $table->integer('train_people')->comment('培训人数')->nullable();
            $table->integer('year_statistic_id')->comment('年度数据id')->index();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('year_statistic_kids');
    }
};
