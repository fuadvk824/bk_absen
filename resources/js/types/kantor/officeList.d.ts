
// export type OfficeList = {
//     id: number;
//     office_code: string;
//     name: string;
//     image: string | null;
//     image_url?: string | null; // ← tambahkan ini
//     phone: string;
//     address: string;
//     city: string;
//     province: string;
//     poscode: string;

//     latitude: number;
//     longitude: number;
//     radius_meter: number;

//     status: 'active' | 'inactive';
// };

export type OfficeList = {
    id: number;
    office_code: string;

    name: string;
    image: string | null;
    image_url: string | null;

    phone: string | null;
    address: string | null;
    city: string | null;
    province: string | null;
    poscode: string | null;

    latitude: number | null;
    longitude: number | null;
    radius_meter: number | null;

    status: 'active' | 'inactive';
    timezone: string;
};