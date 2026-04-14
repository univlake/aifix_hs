<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('safety_management', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable()->comment('姓名');
            $table->integer('safety_management_type_id')->default(1)->comment('类型')->index();
            $table->string('tel')->nullable()->comment('联系电话');
            $table->string('cert_title')->nullable()->comment('证书名称');
            $table->string('cert_number')->nullable()->comment('证书编号');
            $table->date('valid_period')->nullable()->comment('有效期');
            $table->integer('company_id')->required()->index();
            $table->integer('user_id')->default(0)->index();
            $table->integer('last_user_id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('safety_management');
    }
};
