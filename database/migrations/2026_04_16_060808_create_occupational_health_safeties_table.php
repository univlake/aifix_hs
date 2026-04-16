<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('occupational_health_safeties', function (Blueprint $table) {
            $table->id();
            $table->string('certification_body')->nullable()->comment('认证机构');
            $table->string('standard_edition')->nullable()->comment('标准版本');
            $table->date('get_time')->nullable()->comment('取得时间');
            $table->date('valid_period')->nullable()->comment('有效期');
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
        Schema::dropIfExists('occupational_health_safeties');
    }
};
