<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('users');

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('username', 30)->unique();
            $table->string('password');
            $table->unsignedInteger('company_id')->default(0);
            $table->string('nickname', 100);
            $table->string('header_img')->nullable();
            $table->string('phone')->nullable()->unique();
            $table->string('department_name')->nullable();
            $table->string('email')->nullable()->unique();
            $table->unsignedInteger('is_expert')->default(0);
            $table->unsignedInteger('role_id')->default(1);
            $table->unsignedInteger('status')->default(1);
            $table->string('weapp_openid')->nullable()->unique();
            $table->string('weixin_session_key')->nullable();
            $table->unsignedInteger('user_id')->default(0);
            $table->unsignedInteger('last_user_id')->default(0);
            $table->string('login_times')->nullable();
            $table->timestamps();
            $table->softDeletes();

            // Indexes
            $table->index('username');
            $table->index('company_id');
            $table->index('phone');
            $table->index('email');
            $table->index('weapp_openid');
            $table->index('status');
            $table->index('user_id');
            $table->index('last_user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
