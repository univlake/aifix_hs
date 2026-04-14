<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('major_hazards', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('单元名称')->nullable();
            $table->string('level')->comment('级别')->nullable();
            $table->string('position')->comment('位置')->nullable();
            $table->string('r_value')->comment('R值')->default(0);
            $table->integer('is_sis')->comment('SIS/EDS')->default(0);
            $table->string('sil_level')->comment('SIL等级')->nullable();
            $table->string('detect_parameter')->comment('检测远传参数')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('major_hazards');
    }
};
