<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_class_infos', function (Blueprint $table) {
            $table->id();
            $table->string('title')->comment('标题')->nullable();
            $table->text('introduce')->comment('介绍')->nullable();
            $table->text('thumb_url')->comment('缩略图路径')->nullable();
            $table->text('video_url')->comment('视频路径')->nullable();
            $table->integer('times_watched')->comment('观看次数')->default(0);
            $table->string('duration')->comment('时长')->nullable();
            $table->string('lector')->comment('讲师')->nullable();
            $table->integer('training_class_id')->comment('培训课id')->index();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_class_infos');
    }
};
