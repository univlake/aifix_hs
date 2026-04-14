<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('special_types');

        Schema::create('special_types', function (Blueprint $table) {
            $table->id();
            $table->string('title')->comment('设备类型');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('title');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('special_types');
    }
};
