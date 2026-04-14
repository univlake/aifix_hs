<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meeting_notices', function (Blueprint $table) {
            $table->id();
            $table->string('company_name')->comment('企业名称')->nullable();
            $table->integer('meeting_id')->comment('会议id')->index();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('company_group_id')->comment('集团id')->nullable()->index();
            $table->string('company_group_name')->comment('集团名称')->nullable();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meeting_notices');
    }
};
