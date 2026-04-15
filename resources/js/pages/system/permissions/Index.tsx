import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import type { ApiResponse, Permission } from '@/types/models';

export default function PermissionsIndex() {
    const [grouped, setGrouped] = useState<Record<string, Permission[]>>({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.get<ApiResponse<{ list: Permission[]; grouped: Record<string, Permission[]> }>>('/permissions')
            .then((res) => setGrouped(res.data.data.grouped))
            .finally(() => setLoading(false));
    }, []);

    const filtered = Object.entries(grouped).filter(([module, perms]) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return module.toLowerCase().includes(q) || perms.some((p) => p.name.toLowerCase().includes(q));
    });

    const totalPerms = Object.values(grouped).reduce((sum, perms) => sum + perms.length, 0);

    return (
        <>
            <Head title="权限管理" />
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">权限管理</h1>
                    <p className="text-muted-foreground text-sm">
                        共 {Object.keys(grouped).length} 个模块，{totalPerms} 项权限
                    </p>
                </div>
                <Input
                    placeholder="搜索模块或权限..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-sm"
                />
            </div>

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-48" />
                    ))}
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map(([module, perms]) => (
                        <Card key={module}>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center justify-between">
                                    <span>{module}</span>
                                    <Badge variant="secondary">{perms.length}</Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-1">
                                    {perms.map((perm) => (
                                        <Badge key={perm.id} variant="outline" className="text-xs font-normal">
                                            {perm.name}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
}
