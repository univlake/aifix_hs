<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('safety_management_types');

        Schema::create('safety_management_types', function (Blueprint $table) {
            $table->id();
            $table->string('title')->comment('安全管理人员类型');
            $table->integer('is_cert')->default(0)->comment('是否有证书');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('title');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('safety_management_types');
    }
};
