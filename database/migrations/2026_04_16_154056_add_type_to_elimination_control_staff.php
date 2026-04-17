<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('fire_control_room_personnels');
    }

    public function down(): void
    {
        // Intentionally not restored — data is managed via elimination_control_staff
    }
};
