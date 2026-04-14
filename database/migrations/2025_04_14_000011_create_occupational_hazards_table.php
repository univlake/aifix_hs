<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('occupational_hazards', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('场所');
            $table->string('type')->comment('职业危害因素')->nullable();
            $table->integer('number')->comment('接触人数')->nullable();
            $table->string('is_declare')->comment('是否申报')->nullable();
            $table->date('declare_date')->comment('申报日期')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('occupational_hazards');
    }
};
