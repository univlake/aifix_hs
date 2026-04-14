<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hidden_upload_annexes', function (Blueprint $table) {
            $table->id();
            $table->integer('hidden_danger_info_id')->comment('隐患id')->index();
            $table->string('geolocation')->comment('位置信息');
            $table->tinyInteger('is_review')->comment('是否是复查证据')->default(1);
            $table->string('annex_url')->comment('文件路径');
            $table->integer('user_id')->comment('创建用户')->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hidden_upload_annexes');
    }
};
