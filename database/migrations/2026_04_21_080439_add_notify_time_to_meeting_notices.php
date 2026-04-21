<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('meeting_notices', function (Blueprint $table) {
            $table->timestamp('notify_time')->comment('通知发送时间')->nullable()->after('company_group_name');
            $table->timestamp('confirm_time')->comment('企业确认时间')->nullable()->after('notify_time');
        });
    }

    public function down(): void
    {
        Schema::table('meeting_notices', function (Blueprint $table) {
            $table->dropColumn(['notify_time', 'confirm_time']);
        });
    }
};
