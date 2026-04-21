<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * No-op: reverted after stakeholder feedback. Existing fields are reused:
     * rectification_date  → correct_date
     * rectification_description → review_description
     * archive_by → archive_user_id.
     */
    public function up(): void {}

    public function down(): void {}
};
