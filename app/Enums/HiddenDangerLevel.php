<?php

namespace App\Enums;

enum HiddenDangerLevel: string
{
    case General = '一般隐患';
    case Major = '重大隐患';

    public function label(): string
    {
        return $this->value;
    }
}
