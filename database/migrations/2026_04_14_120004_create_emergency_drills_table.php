<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('emergency_drills', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('名称')->nullable();
            $table->date('drill_time')->comment('演练时间')->nullable();
            $table->string('drill_local')->comment('演练地点')->nullable();
            $table->string('organization_department')->comment('组织部门')->nullable();
            $table->string('join_department')->comment('参与部门')->nullable();
            $table->string('drill_number')->comment('演练编号')->nullable();
            $table->string('drill_type')->comment('演练类型')->nullable();
            $table->string('drill_form')->comment('演练形式')->nullable();
            $table->string('drill_kind')->comment('演练种类')->nullable();
            $table->text('event')->comment('事件')->nullable();
            $table->text('annex_url')->comment('附件路径')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('emergency_drills');
    }
};
