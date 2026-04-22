<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('construction_units');
        Schema::dropIfExists('technical_service_units');
    }

    public function down(): void
    {
        Schema::create('construction_units', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('单位名称');
            $table->string('qualification_name')->nullable()->comment('资质名称');
            $table->string('contact')->nullable()->comment('联系人');
            $table->string('contact_tel')->nullable()->comment('联系电话');
            $table->text('annex_url')->nullable()->comment('附件路径');
            $table->integer('company_id')->index();
            $table->integer('user_id')->default(0)->index();
            $table->integer('last_user_id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('technical_service_units', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('单位名称');
            $table->string('service_type')->nullable()->comment('服务类型');
            $table->string('qualification_name')->nullable()->comment('资质名称');
            $table->string('contact')->nullable()->comment('联系人');
            $table->string('contact_tel')->nullable()->comment('联系电话');
            $table->text('annex_url')->nullable()->comment('附件路径');
            $table->integer('company_id')->index();
            $table->integer('user_id')->default(0)->index();
            $table->integer('last_user_id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }
};
