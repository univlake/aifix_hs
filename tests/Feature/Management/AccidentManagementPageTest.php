<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Http\Request;

describe('Accident management page', function () {
    it('shares the authenticated user company id for accident action visibility', function () {
        [$user, $company] = createAdminWithCompany();

        $request = Request::create('/management/accidents/management', 'GET');
        $request->setUserResolver(fn () => $user);

        $shared = app(HandleInertiaRequests::class)->share($request);

        expect($shared['auth']['user'])
            ->toBeArray()
            ->and($shared['auth']['user']['id'])->toBe($user->id)
            ->and($shared['auth']['user']['company_id'])->toBe($company->id);
    });
});
