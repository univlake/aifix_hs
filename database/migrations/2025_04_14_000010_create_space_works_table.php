<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('space_works', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('有限空间名称')->nullable();
            $table->string('position')->comment('位置')->nullable();
            $table->integer('space_work_type_id')->comment('类型id')->default(0)->index();
            $table->string('size')->comment('大小(m²)')->default(0);
            $table->text('word_content')->comment('可能涉及作业内容')->nullable();
            $table->integer('people_num')->comment('可能涉及作业人数')->default(0);
            $table->string('hazard_id')->comment('危险有害因素id')->default(0);
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('space_works');
    }
};
