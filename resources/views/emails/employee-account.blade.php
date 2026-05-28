<!DOCTYPE html>
<html>

<head>
    <meta charset="UTF-8">
    <title>Akun Karyawan Aktif</title>
     
</head>

<body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:0px 0;">
        <tr>
            <td align="center">
                <table width="500" cellpadding="0" cellspacing="0"
                    style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 10px rgba(0,0,0,0.05);">

                    <tr>
                        <td align="center" style="padding:24px;background:#2563eb;">
                           
                          <img src="/public/logo/logo_gaji.jpg" style="height:60px;">
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:24px;color:#333;">
                            <h2 style="margin-top:0;color:#111;">
                                Akun aplikasi <span style="color:#2563eb;">BK Absensi</span> Anda telah aktif
                            </h2>


                            <p>
                                Silakan login ke aplikasi <strong>BK Absensi</strong> menggunakan informasi berikut:
                            </p>

                            <table cellpadding="6" cellspacing="0" style="margin:16px 0;">
                                <tr>
                                    <td><b>Email</b></td>
                                    <td>: {{ $user->email }}</td>
                                </tr>
                                <tr>
                                    <td><b>Password</b></td>
                                    <td>: {{ $password }}</td>
                                </tr>
                            </table>

                            <p style="margin-top:16px;">
                               Setelah anda berhasil login untuk pertama kali, demi kemanan akun silahkan untuk melakukan penggantian password yang sesuai pada menu profile
                            </p>


                            <p>
                                Silakan download aplikasi melalui link berikut:
                            </p>

                            <p>
                                <a href="https://drive.google.com/drive/folders/1_PDbKfDO3lePuAr_coRV1nvAkbSjS34m?usp=drive_link" style="color:#2563eb;">
                                    Download Aplikasi BK Absensi (Khusus Android)
                                </a>
                            </p>
                            <p>
                                <a href="https://absensif.bisakulak.my.id" style="color:#2563eb;">Klik link ini untuk IOS</a>
                            </p>

                            <hr style="border:none;border-top:1px solid #eee;margin:24px 0;">

                            <p style="font-size:13px;color:#666;">
                                Anda menerima email ini karena Admin / HRD dari 
                                <strong>BISA KULAK</strong> telah menambahkan Anda ke aplikasi BK Absensi
                            </p>

                            <p style="margin-top:24px;">
                                Salam,<br>
                                <strong>HR System Bisakulak</strong>
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>

</html>