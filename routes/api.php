<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — v1
|--------------------------------------------------------------------------
| Routes are split into domain files under routes/api/.
| Each file handles one domain and carries its own controller imports.
|
| Domain files:
|   auth.php                — login, register, logout, user-info
|   companies.php           — companies, personnels, base-data, users, roles, permissions
|   base-data.php           — dictionary / type tables (craft types, special types, etc.)
|   safety-records.php      — buildings, job-management, skill-units, design-units, etc.
|   safety-ledger.php       — special-equipment, hazardous-chemicals, major-hazards, etc.
|   occupational-health.php — occupational-hazards, health-files, hygiene-evaluations, etc.
|   emergency-training.php  — fire-safety, emergency, training, meetings, notifications
|   risk-management.php     — hidden-danger-infos, hazards, risk-logs, monthly-investigations
|   inspections.php         — daily/double/system/norm/accident checks, add-points
|   statistics-reporting.php — accident-bulletins, expert-inspections, statistics, bloc, etc.
*/

Route::prefix('v1')->group(function () {
    // Public (auth) routes — includes its own throttle middleware
    require base_path('routes/api/auth.php');

    // All other routes require authentication + scope validation + global rate limiting
    Route::middleware(['auth:api', 'scope', 'throttle:api'])->group(function () {
        require base_path('routes/api/companies.php');
        require base_path('routes/api/base-data.php');
        require base_path('routes/api/safety-records.php');
        require base_path('routes/api/safety-ledger.php');
        require base_path('routes/api/occupational-health.php');
        require base_path('routes/api/emergency-training.php');
        require base_path('routes/api/risk-management.php');
        require base_path('routes/api/inspections.php');
        require base_path('routes/api/statistics-reporting.php');
    });
});
