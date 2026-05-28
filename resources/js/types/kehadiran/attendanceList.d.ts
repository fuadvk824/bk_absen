export interface AttendanceList {
    id: number;
    nama_karyawan: string;
    tanggal: string;

    check_in: string | null;
    check_out: string | null;
    gambar_checkin?: string | null;
    gambar_checkout?: string | null;

    status_checkin: string | null;
    status_checkout: string | null;

    total_waktu: number;
    name_shift: string;
    checkin_time: string;
    checkout_time: string;

    late_proof?: string | null;
    late_reason: string;
    statusAprv: 'pending' | 'approved' | 'rejected' | 'onTime';
}
