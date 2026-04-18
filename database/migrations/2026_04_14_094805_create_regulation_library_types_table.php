<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('regulation_library_types');

        Schema::create('regulation_library_types', function (Blueprint $table) {
            $table->id();
            $table->string('title')->comment('法规类型');
            $table->unsignedBigInteger('pid')->default(0)->comment('父级ID');
            $table->string('all_name')->nullable()->comment('全称');
            $table->integer('sort')->default(0)->comment('排序');
            $table->unsignedBigInteger('company_id')->default(0)->comment('企业ID');
            $table->unsignedBigInteger('user_id')->default(0)->comment('创建人');
            $table->unsignedBigInteger('last_user_id')->default(0)->comment('最后修改人');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('regulation_library_types');
    }
};
