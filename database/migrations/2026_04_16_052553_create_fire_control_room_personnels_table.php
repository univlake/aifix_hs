<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('fire_control_room_personnels', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable()->comment('姓名');
            $table->string('cert_title')->nullable()->comment('证书名称');
            $table->string('cert_number')->nullable()->comment('证书编号');
            $table->date('valid_period')->nullable()->comment('有效期');
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fire_control_room_personnels');
    }
};
