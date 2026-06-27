export interface Office {
    id?: number;
    office_code?: string;

    name: string;
    image?: File | string | null;
    image_url?: string | null;

    phone?: string;
    address?: string;
    city?: string;
    province?: string;
    poscode?: string;

    latitude: number | null;
    longitude: number | null;
    radius_meter: number;

    status: 'active' | 'inactive';
    timezone: string;
}