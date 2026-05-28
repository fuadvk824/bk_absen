export type OfficeList = {
    id: number;
    office_code: string;
    name: string;
    image: string | null;
    image_url?: string | null; // ← tambahkan ini
    phone: string;
    address: string;
    city: string;
    province: string;
    poscode: string;
    status: 'active' | 'inactive';
};
