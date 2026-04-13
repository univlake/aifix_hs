<?php

namespace App\Enums;

enum CompanyStatus: int
{
    case Pending = 0;
    case Enable = 1;
    case UnEnable = 2;

    public function label(): string
    {
        return match ($this) {
            self::Pending => '待审核',
            self::Enable => '已启用',
            self::UnEnable => '已禁用',
        };
    }
}
