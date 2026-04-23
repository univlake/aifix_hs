<?php

namespace App\Enums;

enum MeetingType: string
{
    case Safety = '安全例会';
    case Fire = '消防例会';

    public function label(): string
    {
        return $this->value;
    }
}
