<?php

namespace App\Enums;

enum StandardizationGrade: string
{
    case Level1 = '一级';
    case Level2 = '二级';
    case Level3 = '三级';

    public function label(): string
    {
        return $this->value;
    }
}
