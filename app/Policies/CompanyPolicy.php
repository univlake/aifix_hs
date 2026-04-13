<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\User;

class CompanyPolicy
{
    /**
     * 查看企业列表
     */
    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('companies.list', 'api');
    }

    /**
     * 查看单个企业
     */
    public function view(User $user, Company $company): bool
    {
        return $user->hasPermissionTo('companies.list', 'api');
    }

    /**
     * 创建企业
     */
    public function create(User $user): bool
    {
        return $user->hasPermissionTo('companies.create', 'api');
    }

    /**
     * 更新企业
     */
    public function update(User $user, Company $company): bool
    {
        if ($user->hasPermissionTo('companies.update', 'api')) {
            return true;
        }

        // 额外允许：创建者可以编辑自己创建的企业
        return $company->user_id === $user->id;
    }

    /**
     * 删除企业
     */
    public function delete(User $user, Company $company): bool
    {
        if ($user->hasPermissionTo('companies.delete', 'api')) {
            return true;
        }

        // 额外允许：创建者可以删除自己创建的企业
        return $company->user_id === $user->id;
    }

    /**
     * 审核企业
     */
    public function review(User $user): bool
    {
        return $user->hasPermissionTo('companies.review', 'api');
    }
}
