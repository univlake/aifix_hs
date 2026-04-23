import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import AppLayout from '@/layouts/AppLayout';
import '../css/app.css';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: async (name: string) => {
        const pages = import.meta.glob('./pages/**/*.tsx');
        const key = `./pages/${name}.tsx`;
        const loader = pages[key];

        if (!loader) {
            throw new Error(`Page not found: ${name}`);
        }

        const page: any = await loader();

        // 自动包裹 Layout：auth 页面不包裹，其他页面包裹 AppLayout
        const authPages = ['welcome', 'auth/Login', 'auth/Register'];

        if (!authPages.includes(name) && page.default.layout === undefined) {
            page.default.layout = (children: React.ReactNode) => (
                <AppLayout>{children}</AppLayout>
            );
        }

        return page;
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});
