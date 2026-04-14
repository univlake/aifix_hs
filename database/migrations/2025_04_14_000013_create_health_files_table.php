<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('health_files', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('姓名');
            $table->string('number')->comment('工号')->nullable();
            $table->string('department')->comment('部门')->nullable();
            $table->string('post')->comment('岗位')->nullable();
            $table->date('checkup_date')->comment('体检日期')->nullable();
            $table->text('checkup_expiry')->comment('体检结论')->nullable();
            $table->string('review_situation')->comment('复查情况')->nullable();
            $table->string('handling_opinions')->comment('处理意见')->nullable();
            $table->string('process_result')->comment('处理结果')->nullable();
            $table->text('annex_url')->comment('附件路径')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('health_files');
    }
};
