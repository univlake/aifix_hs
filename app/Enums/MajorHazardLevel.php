<?php

namespace App\Enums;

enum MajorHazardLevel: string
{
    case Level1 = '一级';
    case Level2 = '二级';
    case Level3 = '三级';
    case Level4 = '四级';

    public function label(): string
    {
        return $this->value;
    }
}
