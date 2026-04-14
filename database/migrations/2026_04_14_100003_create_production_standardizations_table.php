<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('production_standardizations', function (Blueprint $table) {
            $table->id();
            $table->string('grade')->comment('等级');
            $table->date('get_time')->nullable()->comment('取得时间');
            $table->date('valid_period')->nullable()->comment('有效期');
            $table->text('annex_url')->nullable()->comment('附件路径');
            $table->integer('company_id')->required()->index();
            $table->integer('user_id')->default(0)->index();
            $table->integer('last_user_id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('production_standardizations');
    }
};
