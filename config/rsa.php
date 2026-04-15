<?php

return [
    /*
     * RSA 2048-bit keypair used for client-side password encryption.
     * Keys are stored base64-encoded to keep .env single-line friendly.
     * Private key never leaves the server; public key is served to clients.
     */
    'private_key' => base64_decode((string) env('RSA_PRIVATE_KEY', '')),
    'public_key' => base64_decode((string) env('RSA_PUBLIC_KEY', '')),
];
