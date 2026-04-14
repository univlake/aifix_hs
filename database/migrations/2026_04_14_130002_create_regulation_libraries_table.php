<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('regulation_libraries', function (Blueprint $table) {
            $table->id();
            $table->string('type')->nullable()->comment('类别');
            $table->string('title')->comment('法律、法规、标准及其他要求');
            $table->date('established_date')->nullable()->comment('制（修）订日期');
            $table->date('effective_date')->nullable()->comment('生效日期');
            $table->string('promulgating_department')->nullable()->comment('颁布部门');
            $table->string('standard_encoding')->nullable()->comment('标准编号');
            $table->date('identify_date')->nullable()->comment('识别（更新）时间');
            $table->string('status')->nullable()->comment('状态');
            $table->text('annex_url')->nullable()->comment('附件路径');
            $table->integer('regulation_library_type_id')->nullable()->index()->comment('类型id');
            $table->integer('company_id')->index()->comment('企业id');
            $table->integer('user_id')->default(0)->index()->comment('创建人id');
            $table->integer('last_user_id')->default(0)->index()->comment('最后修改人id');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('regulation_libraries');
    }
};
