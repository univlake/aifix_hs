<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('regulation_library_types');

        Schema::create('regulation_library_types', function (Blueprint $table) {
            $table->id();
            $table->string('title')->comment('法规类型');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('regulation_library_types');
    }
};
