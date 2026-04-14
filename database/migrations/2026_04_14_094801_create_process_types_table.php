<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('process_types');

        Schema::create('process_types', function (Blueprint $table) {
            $table->id();
            $table->string('title')->comment('工艺名称类型');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('title');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('process_types');
    }
};
