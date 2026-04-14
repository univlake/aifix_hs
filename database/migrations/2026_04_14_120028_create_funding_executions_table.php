<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('funding_executions', function (Blueprint $table) {
            $table->id();
            $table->string('year')->comment('年份')->nullable();
            $table->integer('security_investment_id')->comment('安全投入计划id')->index();
            $table->string('simple_content')->comment('简要内容')->nullable();
            $table->text('content')->comment('详细内容')->nullable();
            $table->decimal('budget', 12, 2)->comment('预算')->nullable();
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('funding_executions');
    }
};
