<?php

namespace App\Enums;

enum SecurityInvestmentType: string
{
    case Safety = '安全投入';
    case Fire = '消防投入';

    public function label(): string
    {
        return $this->value;
    }
}
