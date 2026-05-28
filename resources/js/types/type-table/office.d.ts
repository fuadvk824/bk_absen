export type Office = {
    id: number;
    office_code: string;
    name: string;
    image: File | string | null;
    image_url?: string | null;
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
    poscode?: string;
    status: 'active' | 'inactive';
};
