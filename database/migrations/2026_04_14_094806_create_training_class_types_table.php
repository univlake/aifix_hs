<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('training_class_types');

        Schema::create('training_class_types', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable()->comment('培训课类型名称');
            $table->integer('user_id')->default(0);
            $table->integer('last_user_id')->default(0);
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('user_id');
            $table->index('last_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('training_class_types');
    }
};
