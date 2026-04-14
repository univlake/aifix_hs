<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('safety_architectures', function (Blueprint $table) {
            $table->id();
            $table->text('thumbnail_url')->nullable()->comment('缩略图路径');
            $table->text('annex_url')->nullable()->comment('附件路径');
            $table->integer('company_id')->nullable()->index();
            $table->integer('user_id')->default(0)->index();
            $table->integer('last_user_id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('safety_architectures');
    }
};
