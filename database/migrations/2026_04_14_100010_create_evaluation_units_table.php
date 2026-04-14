<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_units', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('单位名称');
            $table->integer('is_qualification')->default(2)->comment('资质情况1有2无');
            $table->string('qualification_name')->nullable()->comment('资质名称');
            $table->text('qualification_annex_url')->nullable()->comment('资质附件路径');
            $table->text('evaluation_area')->nullable()->comment('施工范围');
            $table->string('contact')->nullable()->comment('联系人');
            $table->string('contact_tel')->nullable()->comment('联系电话');
            $table->integer('is_agreement')->default(2)->comment('安全协议及培训1有2无');
            $table->string('agreement_annex_url')->nullable()->comment('协议及培训附件路径');
            $table->text('supervision_url')->nullable()->comment('监督检查记录路径');
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
        Schema::dropIfExists('evaluation_units');
    }
};
