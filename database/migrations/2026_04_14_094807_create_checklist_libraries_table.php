<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('checklist_libraries');

        Schema::create('checklist_libraries', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->integer('status')->default(1);
            $table->text('preview_annex_url')->nullable();
            $table->text('annex_url')->nullable();
            $table->integer('company_id');
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
        Schema::dropIfExists('checklist_libraries');
    }
};
