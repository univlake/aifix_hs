<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('risk_logs', function (Blueprint $table) {
            $table->float('old_risk_num')->nullable()->default(null)->comment('旧的风险指数')->change();
        });
    }

    public function down(): void
    {
        Schema::table('risk_logs', function (Blueprint $table) {
            $table->float('old_risk_num')->nullable(false)->default(0)->comment('旧的风险指数')->change();
        });
    }
};
