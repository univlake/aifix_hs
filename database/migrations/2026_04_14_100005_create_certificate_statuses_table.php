<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificate_statuses', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable()->comment('名称');
            $table->integer('type')->default(1)->comment('类型');
            $table->integer('should_obtain_people')->nullable()->comment('应取证人数');
            $table->integer('already_obtain_people')->nullable()->comment('已取证人数');
            $table->string('no_obtain_people')->nullable()->comment('未取证人数说明');
            $table->integer('train_people')->nullable()->comment('培训人数');
            $table->integer('company_id')->required()->index();
            $table->integer('user_id')->default(0)->index();
            $table->integer('last_user_id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificate_statuses');
    }
};
