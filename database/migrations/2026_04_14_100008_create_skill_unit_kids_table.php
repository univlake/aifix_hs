<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('skill_unit_kids', function (Blueprint $table) {
            $table->id();
            $table->string('qualification_name')->nullable()->comment('资质名称');
            $table->text('qualification_annex_url')->nullable()->comment('资质附件路径');
            $table->integer('skill_unit_id')->index();
            $table->integer('company_id')->index();
            $table->integer('user_id')->default(0)->index();
            $table->integer('last_user_id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('skill_unit_kids');
    }
};
