<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('report_configs');

        Schema::create('report_configs', function (Blueprint $table) {
            $table->id();
            $table->string('config_day')->nullable()->comment('时间日期');
            $table->integer('type')->nullable()->default(1)->comment('类型');
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
        Schema::dropIfExists('report_configs');
    }
};
