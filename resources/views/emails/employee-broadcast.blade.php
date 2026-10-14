<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <title>Pembaruan Aplikasi Bisa Absen</title>
</head>

<body style="margin:0;padding:0;background-color:#f1f5f9;
    font-family:Arial,Helvetica,sans-serif;color:#1e293b;">

    <table role="presentation" width="100%" cellpadding="0"
        cellspacing="0" border="0" style="background-color:#f1f5f9;">
        <tr>
            <td align="center" style="padding:32px 16px;">

                <!-- Kontainer utama -->
                <table role="presentation" width="600" cellpadding="0"
                    cellspacing="0" border="0"
                    style="width:100%;max-width:600px;background:#ffffff;
                    border-radius:12px;overflow:hidden;">

                    <!-- Header -->
                    <tr>
                        <td style="padding:28px 32px;background-color:#1d4ed8;
                            color:#ffffff;">

                            <h1 style="margin:0;font-size:24px;
                                line-height:1.4;font-weight:bold;color:#ffffff;">
                                APLIKASI BISA ABSEN
                            </h1>

                            <p style="margin:8px 0 0;font-size:14px;
                                line-height:1.6;color:#dbeafe;">
                                Informasi resmi mengenai pembaruan aplikasi
                                Bisa Absen.
                            </p>
                        </td>
                    </tr>

                    <!-- Isi email -->
                    <tr>
                        <td style="padding:32px;">

                            <h2 style="margin:12px 0 12px;font-size:20px;
                                line-height:1.4;color:#0f172a;">
                                Halo, {{ $employeeName }}!
                            </h2>

                            <p style="margin:0 0 20px;font-size:14px;
                                line-height:1.8;color:#475569;text-align:justify;">
                                Kami informasikan bahwa aplikasi Bisa Absen
                                telah tersedia dalam versi terbaru.
                                Pembaruan ini dilakukan untuk meningkatkan
                                kenyamanan pengguna serta mendukung kelancaran
                                proses absensi.
                            </p>

                            <!-- Informasi versi -->
                            <table role="presentation" width="100%"
                                cellpadding="0" cellspacing="0" border="0"
                                style="background-color:#f8fafc;
                                border:1px solid #e2e8f0;border-radius:8px;">
                                <tr>
                                    <td style="padding:20px;">

                                        <p style="margin:0 0 8px;font-size:12px;
                                            color:#64748b;">
                                            VERSI APLIKASI TERBARU
                                        </p>

                                        <p style="margin:0;font-size:24px;
                                            font-weight:bold;color:#1d4ed8;">
                                            v{{ $appVersion->version ?? '-' }}
                                        </p>

                                        @if (!empty($appVersion?->message))
                                        <p style="margin:12px 0 0;
                                                font-size:14px;line-height:1.8;
                                                color:#475569;">
                                            {{ $appVersion->message }}
                                        </p>
                                        @endif

                                    </td>
                                </tr>
                            </table>

                            <!-- Panduan pembaruan -->
                            <h3 style="margin:28px 0 12px;font-size:16px;
                                line-height:1.5;color:#0f172a;">
                                Panduan Pembaruan Aplikasi
                            </h3>

                            <p style="margin:0 0 16px;font-size:14px;line-height:1.8;color:#475569;text-align:justify;">
                                <strong>1. Pengguna Android (APK)</strong><br>
                                Silakan buka aplikasi Bisa Absen seperti biasa. Dialog
                                pembaruan aplikasi akan muncul secara otomatis apabila
                                versi terbaru tersedia. Tekan tombol <strong>Download</strong>
                                untuk mengunduh pembaruan, kemudian ikuti petunjuk
                                instalasi hingga selesai. Setelah proses selesai, aplikasi
                                Anda telah diperbarui ke versi terbaru dan siap digunakan kembali.
                            </p>

                            <p style="margin:0;font-size:14px;line-height:1.8;color:#475569;text-align:justify;">
                                <strong>2. Pengguna iOS (PWA)</strong><br>
                                Untuk memperbarui aplikasi Bisa Absen, silakan hapus
                                (uninstall) terlebih dahulu aplikasi dari layar utama
                                perangkat Anda. Selanjutnya, buka situs web absensi resmi
                                melalui browser Safari pada tautan berikut:
                                <br>
                                <a href="https://domain-absensi-anda.com"
                                    style="color:#1d4ed8;text-decoration:underline;word-break:break-word;">
                                    https://absensif.bisakulak.my.id
                                </a>
                                <br>
                                Setelah situs terbuka, pilih opsi
                                <strong>Tambahkan ke Layar Utama (Add to Home Screen)</strong>
                                untuk memasang kembali aplikasi Bisa Absen. Setelah proses
                                selesai, buka aplikasi melalui ikon di layar utama untuk
                                menggunakan versi terbaru.
                            </p>


                            <p style="margin:24px 0 0;font-size:14px;
                                line-height:1.8;color:#475569;text-align:justify;">
                                Kami mengimbau seluruh pengguna untuk
                                menggunakan versi aplikasi terbaru agar
                                dapat menikmati peningkatan dan perbaikan
                                yang telah disediakan.
                            </p>

                            <p style="margin:24px 0 0;font-size:14px;
                                line-height:1.8;color:#334155;">
                                Salam,<br>
                                <strong style="color:#0f172a;">
                                    Developer Bisakulak
                                </strong>
                            </p>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding:20px 32px;
                            background-color:#f8fafc;
                            border-top:1px solid #e2e8f0;">

                            <p style="margin:0;text-align:center;
                                font-size:12px;line-height:1.8;
                                color:#64748b;">
                                Email ini merupakan pemberitahuan resmi
                                mengenai pembaruan aplikasi Bisa Absen.
                            </p>

                            <p style="margin:8px 0 0;text-align:center;
                                font-size:11px;color:#94a3b8;">
                                &copy; {{ date('Y') }} Bisa Absen.
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>

</html>