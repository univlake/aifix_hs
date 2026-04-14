<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('health_checkups', function (Blueprint $table) {
            $table->id();
            $table->string('type')->comment('体检类别');
            $table->string('department')->comment('体检部门')->nullable();
            $table->integer('number')->comment('体检人数')->nullable();
            $table->date('checkup_date')->comment('体检日期')->nullable();
            $table->text('checkup_expiry')->comment('体检结论')->nullable();
            $table->text('measure')->comment('防控措施')->nullable();
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
        Schema::dropIfExists('health_checkups');
    }
};
