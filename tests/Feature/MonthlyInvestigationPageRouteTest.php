<?php

describe('Monthly investigation page routes', function () {
    it('serves the renamed risk page route', function () {
        $this->get('/risk/monthly-investigation')
            ->assertOk();
    });

    it('serves the renamed risk-control page route', function () {
        $this->get('/risk-control/monthly-investigation')
            ->assertOk();
    });

    it('does not expose the old hidden-danger page routes', function () {
        $this->get('/risk/hidden-danger')
            ->assertNotFound();

        $this->get('/risk-control/hidden-danger')
            ->assertNotFound();
    });
});
