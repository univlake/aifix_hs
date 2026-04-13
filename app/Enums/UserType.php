<?php

namespace App\Enums;

enum UserType: int
{
    case Enable = 1;
    case UnEnable = 2;

    public function label(): string
    {
        return match ($this) {
            self::Enable => '正常',
            self::UnEnable => '禁用',
        };
    }
}
