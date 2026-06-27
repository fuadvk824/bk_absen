export type User = {
    id: number;
    user_code: string;
    name: string;
    email: string;

    no_telepon?: string;
    nik?: string;
    jenis_kelamin?: 'L' | 'P';
    tanggal_lahir?: string;
    alamat?: string;
    
    email_verified_at?: string;
    created_at?: string;
    updated_at?: string;
};
