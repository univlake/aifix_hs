import { useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function AccountIndex() {
    useEffect(() => {
        router.replace('/system/users');
    }, []);
    return null;
}
