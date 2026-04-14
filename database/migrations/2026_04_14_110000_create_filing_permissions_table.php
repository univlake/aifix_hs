<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('filing_permissions', function (Blueprint $table) {
            $table->id();
            $table->integer('record_type_id')->nullable()->index()->comment('备案类型id');
            $table->string('issuing_department')->nullable()->comment('发证部门');
            $table->text('filing_range')->nullable()->comment('备案/许可范围');
            $table->date('filing_time')->nullable()->comment('备案/许可时间');
            $table->date('valid_period')->nullable()->comment('有效期');
            $table->text('comment')->nullable()->comment('备注');
            $table->text('annex_url')->nullable()->comment('附件路径');
            $table->integer('company_id')->index()->comment('企业id');
            $table->integer('user_id')->default(0)->index()->comment('创建人id');
            $table->integer('last_user_id')->default(0)->index()->comment('最后修改人id');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('filing_permissions');
    }
};
