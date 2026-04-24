<?php

namespace App\Services;

use App\Models\User;

/**
 * Validates usernames for the profile / first-login-setup flows.
 *
 * Rules:
 *  - 3–30 chars
 *  - First and last char must be [a-zA-Z0-9]; interior may include `_` `-` `.`
 *  - `^c\d+_admin$` is reserved for auto-provisioned subsidiary admins
 *  - Must be unique across soft-delete-active users (optionally excluding one id)
 */
class UsernameValidator
{
    public const MIN_LENGTH = 3;

    public const MAX_LENGTH = 30;

    private const FORMAT_PATTERN = '/^[a-zA-Z0-9](?:[a-zA-Z0-9_\-.]{1,28}[a-zA-Z0-9])?$/';

    private const RESERVED_PATTERN = '/^c\d+_admin$/';

    /**
     * Return `[available, reason]`. `reason` is null when available is true.
     *
     * @return array{available: bool, reason: string|null}
     */
    public static function check(?string $username, ?int $excludeUserId = null): array
    {
        $username = is_string($username) ? trim($username) : '';

        if ($username === '') {
            return ['available' => false, 'reason' => '用户名不能为空'];
        }

        $length = mb_strlen($username);
        if ($length < self::MIN_LENGTH || $length > self::MAX_LENGTH) {
            return ['available' => false, 'reason' => '用户名长度须为 3–30 个字符'];
        }

        if (! preg_match(self::FORMAT_PATTERN, $username)) {
            return ['available' => false, 'reason' => '只允许字母、数字、下划线、连字符、点，且首尾必须是字母或数字'];
        }

        if (preg_match(self::RESERVED_PATTERN, $username)) {
            return ['available' => false, 'reason' => '该格式为系统保留，不可使用'];
        }

        $query = User::query()->where('username', $username);
        if ($excludeUserId !== null) {
            $query->where('id', '!=', $excludeUserId);
        }

        if ($query->exists()) {
            return ['available' => false, 'reason' => '该用户名已被使用'];
        }

        return ['available' => true, 'reason' => null];
    }
}
