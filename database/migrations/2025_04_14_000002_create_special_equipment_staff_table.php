<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('special_equipment_staff', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('姓名')->nullable();
            $table->string('cert_title')->comment('证书名称')->nullable();
            $table->string('cert_number')->comment('证书编号')->nullable();
            $table->date('valid_period')->comment('有效期')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('special_equipment_staff');
    }
};
