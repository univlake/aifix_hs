<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('other_trainings', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('培训名称')->nullable();
            $table->text('comment')->comment('培训内容')->nullable();
            $table->string('object')->comment('培训对象')->nullable();
            $table->integer('number')->comment('培训人数')->nullable();
            $table->date('training_date')->comment('培训时间')->nullable();
            $table->text('task_content')->comment('任务内容')->nullable();
            $table->text('annex_url')->comment('附件路径')->nullable();
            $table->text('summary_annex_url')->comment('培训教材附件路径')->nullable();
            $table->text('sign_annex_url')->comment('签到表附件路径')->nullable();
            $table->text('material_annex_url')->comment('培训效果评估附件路径')->nullable();
            $table->text('photo_annex_url')->comment('照片附件路径')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('other_trainings');
    }
};
