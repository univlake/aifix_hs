<?php

namespace App\Enums;

enum CorrectionResult: string
{
    case Rectified = '已整改';
    case Unrectified = '未整改';
    case Partial = '部分整改';
    case Insufficient = '整改不到位';

    public function label(): string
    {
        return $this->value;
    }
}
