<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('space_work_types');

        Schema::create('space_work_types', function (Blueprint $table) {
            $table->id();
            $table->string('title')->comment('有限空间辨识类型');
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('title');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('space_work_types');
    }
};
