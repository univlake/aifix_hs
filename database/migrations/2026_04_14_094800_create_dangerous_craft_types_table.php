<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('dangerous_craft_types');

        Schema::create('dangerous_craft_types', function (Blueprint $table) {
            $table->id();
            $table->string('title')->comment('危险工艺类型');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('title');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dangerous_craft_types');
    }
};
