<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_sign_ups', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')->comment('企业名称')->nullable();
            $table->string('name')->comment('姓名')->nullable();
            $table->string('sex')->comment('性别')->nullable();
            $table->string('job_title')->comment('职务')->nullable();
            $table->string('tel')->comment('联系电话')->nullable();
            $table->string('card_number')->comment('身份证号')->nullable();
            $table->string('is_driving')->comment('是否自驾')->nullable();
            $table->integer('meeting_id')->comment('会议id')->index();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_sign_ups');
    }
};
