import { router } from '@inertiajs/react';
import { useEffect } from 'react';

export default function AccountIndex() {
    useEffect(() => {
        router.replace('/system/users');
    }, []);

    return null;
}
