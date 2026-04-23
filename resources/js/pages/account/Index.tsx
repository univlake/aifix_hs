import { router } from '@inertiajs/react';
import { useEffect } from 'react';

export default function AccountIndex() {
    useEffect(() => {
        router.visit('/system/users', { replace: true });
    }, []);

    return null;
}
