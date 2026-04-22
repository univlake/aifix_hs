<?php

/**
 * Smoke test every Inertia page route as an admin.
 *
 * Catches server-side render errors (bad page names, missing data, etc.).
 * Accepts 200 / 302 / 403 as OK — 500 means a crash.
 */
function smokeTestUris(): array
{
    $content = file_get_contents(base_path('routes/web.php'));
    preg_match_all("/Route::inertia\\(\\s*'([^']+)'/", $content, $matches);

    return collect($matches[1])
        ->filter(fn (string $uri) => ! str_contains($uri, '{'))
        ->values()
        ->all();
}

it('renders every Inertia page route without server error', function () {
    [$user] = createAdminWithCompany();
    $public = ['/', '/login', '/register'];
    $failures = [];
    $uris = smokeTestUris();

    expect(count($uris))->toBeGreaterThan(100, 'Expected 100+ routes; got '.count($uris));

    foreach ($uris as $uri) {
        $path = '/'.ltrim($uri, '/');

        $response = in_array($path, $public, true)
            ? $this->get($path)
            : $this->actingAs($user, 'web')->get($path);

        $status = $response->status();

        if (! in_array($status, [200, 302, 403, 422], true)) {
            $failures[] = "{$path} → {$status}";
        }
    }

    expect($failures)->toBe([], 'Routes that returned unexpected status: '.implode(', ', $failures));
});
