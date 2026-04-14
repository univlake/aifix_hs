<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('information_drafts', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('标题');
            $table->string('company_name')->comment('起草企业名称');
            $table->string('draft_department')->comment('起草部门')->nullable();
            $table->string('draft_others')->comment('起草人')->nullable();
            $table->text('comment')->comment('内容')->nullable();
            $table->string('annex_url')->comment('附件路径')->nullable();
            $table->integer('next_reviewer')->comment('下一审核人')->nullable();
            $table->integer('status')->comment('状态')->nullable()->default(0);
            $table->integer('is_top')->comment('是否置顶')->nullable()->default(0);
            $table->integer('company_id')->comment('企业id')->index();
            $table->integer('user_id')->comment('创建人id')->default(0)->index();
            $table->integer('last_user_id')->comment('最后修改人id')->default(0)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('information_drafts');
    }
};
