import { PlaceholderPage } from '@/components/PlaceholderPage';
import { UserCircle } from 'lucide-react';

export default function AccountIndex() {
    return (
        <PlaceholderPage
            title="账号管理"
            description="管理个人账号信息，修改密码、更新联系方式及查看登录记录。"
            icon={UserCircle}
            accent="blue"
        />
    );
}
