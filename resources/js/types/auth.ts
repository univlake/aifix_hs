export type User = {
    id: number;
    username?: string;
    nickname?: string;
    name: string;
    email: string;
    company_id?: number | null;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
};

export type Auth = {
    user: User;
};
