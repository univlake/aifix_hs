<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Adds a flag forcing auto-provisioned subsidiary admins to change both
 * their username and password on first login. Set to 1 when a company
 * auto-creates its admin account; cleared by the first-login-setup
 * endpoint after both credentials are changed.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('must_change_credentials')
                ->default(false)
                ->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('must_change_credentials');
        });
    }
};
