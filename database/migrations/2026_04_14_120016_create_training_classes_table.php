<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_classes', function (Blueprint $table) {
            $table->id();
            $table->string('title')->comment('标题')->nullable();
            $table->text('introduce')->comment('介绍')->nullable();
            $table->text('thumb_url')->comment('缩略图路径')->nullable();
            $table->string('grade')->comment('等级')->nullable();
            $table->integer('class_hours')->comment('课时')->default(0);
            $table->integer('training_class_type_id')->comment('培训课类型id')->nullable()->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_classes');
    }
};
