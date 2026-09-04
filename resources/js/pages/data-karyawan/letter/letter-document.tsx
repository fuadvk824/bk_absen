
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';
import type { Letter, LetterType } from '@/types/type-table/letter';

const styles = StyleSheet.create({
    page: {
        paddingTop: 42,
        paddingBottom: 45,
        paddingLeft: 55,
        paddingRight: 55,

        fontFamily: 'Times-Roman',
        fontSize: 11,
        color: '#111111',

        borderWidth: 1,
        borderColor: '#c9a227',
    },

    // KOP SURAT____________________________________________________________

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 5,
        borderBottomWidth: 1.5,
        borderBottomColor: '#111111',
    },

    logoContainer: {
        width: 135,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },

    logo: {
        width: 130,
        height: 80,
        objectFit: 'contain',
    },

    companyContainer: {
        flex: 1,
        justifyContent: 'center',
    },

    companyName: {
        fontFamily: 'Times-Bold',
        fontSize: 17,
        marginBottom: 4,
    },

    companyAddress: {
        fontSize: 10,
        lineHeight: 1.3,
    },

    companyContact: {
        fontSize: 10,
        marginTop: 2,
    },

    // JUDUL_______________________________________________________________

    titleContainer: {
        alignItems: 'center',
        marginTop: 18,
        marginBottom: 18,
    },

    title: {
        fontFamily: 'Times-Bold',
        fontSize: 12,
        textDecoration: 'underline',
        marginBottom: 4,
    },

    // TANGGAL_____________________________________________________________

    beetwen: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    dateContainer: {
        alignItems: 'flex-end',
        marginBottom: 2,
    },

    date: {
        fontSize: 11,
    },

    // INFORMASI SURAT_____________________________________________________

    letterInfo: {
        width: '50%',
        marginTop: 2,
        marginBottom: 20,
    },

    infoRow: {
        flexDirection: 'row',
        marginBottom: 3,
    },

    infoLabel: {
        width: 55,
    },

    infoSeparator: {
        width: 12,
    },

    infoValue: {
        flex: 1,
    },

    // PENERIMA___________________________________________________________

    recipient: {
        marginBottom: 20,
    },

    recipientLine: {
        marginBottom: 2,
    },

    // ISI SURAT__________________________________________________________

    paragraph: {
        fontSize: 11,
        lineHeight: 1.35,
        textAlign: 'justify',
        marginBottom: 13,
    },

    bold: {
        fontFamily: 'Times-Bold',
    },

    // PENUTUP____________________________________________________________

    closing: {
        fontSize: 11,
        lineHeight: 1.35,
        marginTop: 2,
        textAlign: 'justify',
    },

    // TANDA TANGAN_______________________________________________________

    signatureSection: {
        marginTop: 35,
    },

    signatureRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    signatureColumn: {
        width: '42%',
        alignItems: 'center',
    },

    signatureColumnCenter: {
        width: '42%',
        alignItems: 'center',
        marginTop: 25,
        marginLeft: '29%',
    },

    signatureLabel: {
        fontSize: 11,
        marginBottom: 25,
    },

    signaturePosition: {
        fontSize: 11,
        textDecoration: 'underline',
    },

    signatureName: {
        fontSize: 11,
        textDecoration: 'underline',
    },

    // AREA TTD__________________________________________________________

    signatureSpace: {
        height: 25,
    },
});

const letterTypeLabels: Record<LetterType, string> = {
    SP1: 'SURAT PERINGATAN PERTAMA (SP 1)',
    SP2: 'SURAT PERINGATAN KEDUA (SP 2)',
    SP3: 'SURAT PERINGATAN KETIGA (SP 3)',
    probation: 'SURAT PROBATION',
    paklaring: 'SURAT PAKLARING',
};

const getWarningNumber = (type: LetterType) => {
    switch (type) {
        case 'SP1':
            return 'Pertama (SP 1)';
        case 'SP2':
            return 'Kedua (SP 2)';
        case 'SP3':
            return 'Ketiga (SP 3)';
        default:
            return '';
    }
};

const getNoteSP = (type: LetterType) => {
    switch (type) {
        case 'SP1':
            return 'Kedua (SP 2)';
        case 'SP2':
            return 'Ketiga (SP 3)';
        default:
            return '';
    }
};

const capitalize = (text?: string | null) => {
    if (!text) return '-';

    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

const formatDate = (date?: string | null) => {
    if (!date) {
        return '-';
    }

    const [year, month, day] = date.split('-');

    const monthNames = [
        'Januari',
        'Februari',
        'Maret',
        'April',
        'Mei',
        'Juni',
        'Juli',
        'Agustus',
        'September',
        'Oktober',
        'November',
        'Desember',
    ];

    const monthIndex = Number(month) - 1;

    if (!year || !month || !day || !monthNames[monthIndex]) {
        return date;
    }

    return `${day} ${monthNames[monthIndex]} ${year}`;
};

export const LetterDocument = ({ letter }: { letter: Letter }) => {
    const isWarning = letter.jenis_surat === 'SP1' || letter.jenis_surat === 'SP2';
    const isPhk = letter.jenis_surat === 'SP3';

    const renderWarning = () => (
        <>
            <Text style={styles.paragraph}>
                Berdasarkan hasil evaluasi yang telah dilakukan, kami menemukan bahwa Saudara{' '}
                <Text style={styles.bold}>{letter.alasan_surat}</Text>
                {'. '}
                Sehingga hal tersebut berdampak pada kelancaran operasional Perusahaan.
            </Text>
            <Text style={styles.paragraph}>
                Sehubungan dengan hal tersebut, kami memberikan{' '}
                <Text style={styles.bold}>Surat Peringatan {getWarningNumber(letter.jenis_surat)}</Text> kepada{' '}
                <Text style={styles.bold}>Sdr. {letter.name || '-'}</Text> sebagai bentuk pembinaan agar Saudara dapat
                bekerja dengan lebih baik dan dapat bekerjasama dengan tim dalam menjalankan tugas sesuai ketentuan dan
                standar kerja yang berlaku di Perusahaan.
            </Text>
            <Text style={styles.paragraph}>
                <Text style={styles.bold}>Surat Peringatan {getWarningNumber(letter.jenis_surat)}</Text> ini sebagai
                pembinaan dan peringatan untuk tidak mengulangi perbuatan serupa di masa mendatang. Apabila kejadian ini
                terulang kembali, maka perusahaan berhak memberikan{' '}
                <Text style={styles.bold}>Surat Peringatan {getNoteSP(letter.jenis_surat)} </Text>
                hingga pemutusan hubungan kerja (PHK) sesuai ketentuan yang berlaku.
            </Text>
            <Text style={styles.closing}>Demikian surat ini dibuat agar di laksanakan dan dipatuhi oleh Saudara.</Text>
        </>
    );

    const renderPhk = () => (
        <>
            <Text style={styles.paragraph}>
                Sehubungan dengan hasil evaluasi kinerja dan kedisiplinan kerja Saudara, serta mengacu pada{' '}
                <Text style={styles.bold}>Surat Peringatan Kedua (SP 2)</Text> yang telah diberikan sebelumnya, dengan ini
                perusahaan memberikan <Text style={styles.bold}>Surat Peringatan Ketiga (SP 3)</Text> atas pelanggaran yang
                kembali Saudara lakukan. Adapun pelanggaran tersebut antara lain:
            </Text>
            <Text style={styles.paragraph}>{letter.alasan_surat}</Text>
            <Text style={styles.paragraph}>
                Melalui Surat Peringatan Ketiga ini, perusahaan memberikan{' '}
                <Text style={styles.bold}>peringatan terakhir</Text> kepada Saudara. Apabila di kemudian hari Saudara kembali
                melakukan pelanggaran serupa atau pelanggaran lainnya, maka perusahaan akan mengambil tindakan tegas sesuai
                dengan ketentuan yang berlaku.
            </Text>
            <Text style={styles.closing}>
                Demikian surat peringatan ini disampaikan untuk menjadi perhatian dan perbaikan Saudara ke depannya. Atas
                perhatian Saudara, kami ucapkan terima kasih
            </Text>
        </>
    );

    const renderOther = () => (
        <>
            <Text style={styles.paragraph}>
                Dengan ini perusahaan memberikan <Text style={styles.bold}>{letterTypeLabels[letter.jenis_surat]}</Text>{' '}
                kepada karyawan tersebut di atas sehubungan dengan alasan sebagai berikut:
            </Text>
            <Text style={styles.paragraph}>
                <Text style={styles.bold}>Alasan:</Text> {letter.alasan_surat || '-'}
            </Text>
            <Text style={styles.closing}>Demikian surat ini dibuat agar di laksanakan dan dipatuhi oleh Saudara.</Text>
        </>
    );

    const renderLetterContent = () => {
        if (isWarning) {
            return renderWarning();
        }

        if (isPhk) {
            return renderPhk();
        }

        return renderOther();
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                <View style={styles.header}>
                    <View style={styles.logoContainer}>
                        <Image src="/logo/logo_gaji.jpg" style={styles.logo} />
                    </View>

                    <View style={styles.companyContainer}>
                        <Text style={styles.companyName}>BISA KULAK DEPT. STORE</Text>
                        <Text style={styles.companyAddress}>Jalan Kepatihan Industri No.49, Guntung, Kepatihan,</Text>
                        <Text style={styles.companyAddress}>Kec. Menganti, Kabupaten Gresik, Jawa Timur</Text>
                        <Text style={styles.companyContact}>Telp 0851 7337 2019 Kode Pos 61174</Text>
                    </View>
                </View>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>SURAT PERINGATAN</Text>
                </View>

                <View style={styles.beetwen}>
                    <View style={styles.letterInfo}>
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Nomor</Text>
                            <Text style={styles.infoSeparator}>:</Text>
                            <Text style={styles.infoValue}>{letter.nomor_surat || '-'}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Hal</Text>
                            <Text style={styles.infoSeparator}>:</Text>
                            <Text style={styles.infoValue}>Surat Peringatan {getWarningNumber(letter.jenis_surat)}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Lampiran</Text>
                            <Text style={styles.infoSeparator}>:</Text>
                            <Text style={styles.infoValue}>-</Text>
                        </View>
                    </View>

                    <View style={styles.dateContainer}>
                        <Text style={styles.date}>Gresik, {formatDate(letter.tanggal_surat)}</Text>
                    </View>
                </View>

                <View style={styles.recipient}>
                    <Text style={styles.recipientLine}>Yth. Sdr/i. {letter.name || '-'}</Text>
                    <Text style={styles.recipientLine}>
                        {capitalize(letter.jabatan)} {capitalize(letter.name_office)}
                    </Text>
                    <Text style={styles.recipientLine}>Di tempat</Text>
                </View>

                {renderLetterContent()}

                <View style={styles.signatureSection}>
                    <View style={styles.signatureRow}>
                        <View style={styles.signatureColumn}>
                            <Text style={styles.signatureLabel}>Hormat saya,</Text>
                            <View style={styles.signatureSpace} />
                            <Text style={styles.signaturePosition}>Bisa Kulak Pusat</Text>
                        </View>

                        <View style={styles.signatureColumn}>
                            <Text style={styles.signatureLabel}>Mengetahui,</Text>
                            <View style={styles.signatureSpace} />
                            <Text style={styles.signatureName}>Bagus I Made Saputra</Text>
                        </View>
                    </View>

                    <View style={styles.signatureColumnCenter}>
                        <Text style={styles.signatureLabel}>Menyetujui,</Text>
                        <View style={styles.signatureSpace} />
                        <Text style={styles.signatureName}>{letter.name || '-'}</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};

