

<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Slip Gaji</title>

    @php
        $fontPath = public_path('fonts/RobotoCondensed-Regular.ttf');
    @endphp

    <style>
        @font-face {
            font-family: 'Roboto Condensed';
            src: url("{{ $fontPath }}") format("truetype");
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Roboto Condensed', sans-serif;
            font-size: 12px;
            color: #000;
            margin: 0;
            padding: 0;
        }

        .container {
            width: 100%;
            border: 1px solid #d1d5db;
            background: #fffbeb;
            padding: 14px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        .header-table td {
            vertical-align: top;
        }

        .logo {
            width: 95px;
        }

        .company-name {
            font-size: 24px;
            font-weight: bold;
            line-height: 1;
            margin-bottom: 4px;
        }

        .small-text {
            font-size: 11px;
        }

        .header-right {
            text-align: right;
        }

        .header-title {
            font-size: 24px;
            font-weight: bold;
            line-height: 1;
            margin-bottom: 4px;
        }

        .header-border {
            border-bottom: 2px solid #000;
            /* padding-bottom: 6px; */
            padding-left: 6px;
        }

        .info-wrapper {
            margin-top: 18px;
            margin-bottom: 18px;
        } 

        .info-left {
            width: 60%;
            vertical-align: top;
        }

        .info-right {
            width: 40%;
            text-align: right;
            vertical-align: top;
        }

        .info-table td {
            padding: 2px 0;
            vertical-align: top;
        }

        .label {
            width: 120px;
            font-weight: bold;
        }

        .colon {
            width: 10px;
            text-align: center;
            font-weight: bold;
        }

        .value {
            font-weight: bold;
        }

        .workday-box {
            display: inline-block;
            border: 2px solid #000;
            padding: 6px 16px;
            text-align: center;
            font-size: 11px;
        }

        .workday-box .underline {
            text-decoration: underline;
        }

        .workday-box .number {
            margin-top: 3px;
            font-size: 14px;
            font-weight: bold;
        }

        .section-header {
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            font-weight: bold;
            font-size: 12px;
        }

        .section-header td {
            padding: 6px 0;
        }

        .salary-content {
            margin-top: 8px;
        }

        .salary-left {
            width: 50%;
            padding-right: 14px;
            vertical-align: top;
        }

        .salary-right {
            width: 50%;
            padding-left: 14px;
            vertical-align: top;
        }

        .item-table td {
            /* padding: 2px 0; */
            font-size: 12px;
        }

        .item-name {
            width: 50%;
        }

        .item-colon {
            width: 10px;
            text-align: center;
        }

        .item-rp {
            width: 25px;
        }

        .item-value {
            text-align: right;
        }

        .total-table {
            margin-top: 10px;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            font-weight: bold;
        }

        .total-table td {
            padding: 6px 0;
            vertical-align: top;
        }

        .total-half {
            width: 50%;
        }

        .total-flex {
            width: 100%;
        }

        .total-flex td {
            padding: 0;
        }

        .total-label {
            width: 50%;
        }

        .total-rp {
            width: 25px;
            padding-left: 0px;
        }

        .total-value {
            text-align: right;
            padding-right: 10px;
        }

        .footer {
            margin-top: 22px;
        }

        .footer-left {
            width: 50%;
            vertical-align: top;
        }

        .footer-right {
            width: 50%;
            text-align: right;
            position: relative;
        }

        .take-home td {
            padding: 1px 0;
        }

        .italic {
            font-style: italic;
            margin-top: 2px;
        }

        .stamp-wrapper {
            position: relative;
            display: inline-block;
            width: 180px;
            height: 120px;
        }

        .stamp-image {
            position: absolute;
            right: 0;
            top: 0;
            width: 120px;
            opacity: 0.95;
        }

        .stamp-text {
            position: absolute;
            width: 100%;
            text-align: center;
            top: 10px;
            left: 0;
            z-index: 2;
        }

        .stamp-text .top {
            margin-bottom: 55px;
        }

        .stamp-text .bottom {
            font-weight: bold;
        }
    </style>
</head>

<body>

    <div class="container">

        {{-- HEADER --}}
        <table class="header-table">
            <tr>
                <td width="22%">
                    <img src="{{ public_path('logo/logo_gaji.jpg') }}" class="logo"  style="
                        width: 100%;
                        object-fit: cover;
                        display: block;
                    ">
                     
                </td>
                <td class="header-border">
                    <table>
                        <tr>
                            <td>
                                <div class="company-name">
                                    BISA KULAK JATIM
                                </div>

                                <div class="small-text">
                                    Jl. Raya Kepatihan No. 49, Kec. Menganti
                                </div>

                                <div class="small-text">
                                    Kab. Gresik, Jawa Timur
                                </div>
                            </td>

                            <td class="header-right">
                                <div class="header-title">
                                    SLIP GAJI
                                </div>

                                <div class="small-text">
                                    Periode
                                    {{ \Carbon\Carbon::create($payroll->year, $payroll->month)->translatedFormat('F Y') }}
                                </div>

                                <div class="small-text" style="font-style: italic;">
                                    {{ $periodStart }} - {{ $periodEnd }}
                                </div>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>

        {{-- INFO --}}
        <table class="info-wrapper">
            <tr>
                <td class="info-left">

                    <table class="info-table">
                        <tr>
                            <td class="label">Nama</td>
                            <td class="colon">:</td>
                            <td class="value">{{ $employee->name }}</td>
                        </tr>

                        <tr>
                            <td class="label">ID</td>
                            <td class="colon">:</td>
                            <td class="value">{{ $employee->employee_code }}</td>
                        </tr>
                    </table>

                </td>

                <td class="info-right">
                    <div class="workday-box">
                        <div class="underline">Jumlah Hari kerja :</div>
                        <div class="number">{{ $totalWorkDays }}</div>
                    </div>
                </td>
            </tr>
        </table>

        {{-- HEADER PENDAPATAN --}}
        <table class="section-header">
            <tr>
                <td width="50%">PENDAPATAN</td>
                <td width="50%" style="padding-left: 14px;">POTONGAN</td>
            </tr>
        </table>

        {{-- CONTENT --}}
        <table class="salary-content">
            <tr>

                {{-- PENDAPATAN --}}
                <td class="salary-left">

                    <table class="item-table">
                        @forelse($additions as $item)
                            <tr>
                                <td>
                                    <div style="width: 100%; display:flex; flex-direction: row;">
                                        <div style="width: 50%; display: flex; flex-direction: row; justify-content: space-between;">
                                            <span>{{ $item['name'] }}</span>
                                            <span>:</span>
                                        </div>
                                        <div style="width: 50%; display: flex; flex-direction: row; justify-content: space-between;">
                                            <span>Rp</span>
                                            <span> {{ number_format($item['amount'], 0, ',', '.') }}</span>
                                        </div>
                                    </div>
                                </td>
                                <!-- <td class="item-name">
                                    {{ $item['name'] }}
                                </td>

                                <td class="item-colon">:</td>

                                <td class="item-rp" style=" border: 2px solid #000;">Rp</td>

                                <td class="item-value">
                                    {{ number_format($item['amount'], 0, ',', '.') }}
                                </td> -->
                            </tr>
                        @empty
                            <tr>
                                <td>-</td>
                            </tr>
                        @endforelse
                    </table>

                </td>

                {{-- POTONGAN --}}
                <td class="salary-right">

                    <table class="item-table">
                        @forelse($deductions as $item)
                            <tr>
                                <td class="item-name">
                                    {{ $item['name'] }}
                                </td>

                                <td class="item-colon">:</td>

                                <td class="item-rp" >Rp</td>

                                <td class="item-value">
                                    {{ number_format($item['amount'], 0, ',', '.') }}
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td>-</td>
                            </tr>
                        @endforelse
                    </table>

                </td>

            </tr>
        </table>

        {{-- TOTAL --}}
        <table class="total-table">
            <tr>

                <td class="total-half" style="padding-right: 14px;">
                    <table class="total-flex">
                        <tr>
                            <td class="total-label" style=" border: 2px solid #000;">
                                JUMLAH PENDAPATAN
                            </td>

                            <td class="total-rp" style=" border: 2px solid #000;">Rp</td>

                            <td class="total-value" >
                                {{ number_format($payroll->basic_salary + $payroll->total_additions, 0, ',', '.') }}
                            </td>
                        </tr>
                    </table>
                </td>

                <td class="total-half" style="padding-left: 14px;">
                    <table class="total-flex">
                        <tr>
                            <td class="total-label">
                                JUMLAH POTONGAN
                            </td>

                            <td class="total-rp">Rp</td>

                            <td class="total-value">
                                {{ number_format($payroll->total_deductions, 0, ',', '.') }}
                            </td>
                        </tr>
                    </table>
                </td>

            </tr>
        </table>

        {{-- FOOTER --}}
        <table class="footer">
            <tr>

                {{-- TAKE HOME PAY --}}
                <td class="footer-left">

                    <table class="take-home">
                        <tr>
                            <td class="label">
                                <strong>GAJI YANG DITERIMA</strong>
                            </td>

                            <td class="colon">
                                <strong>:</strong>
                            </td>

                            <td class="item-rp">
                                <strong>Rp</strong>
                            </td>

                            <td class="item-value">
                                <strong>
                                    {{ number_format($payroll->net_salary, 0, ',', '.') }}
                                </strong>
                            </td>
                        </tr>
                    </table>

                    <div class="italic">(Take Home Pay)</div>

                </td>

                {{-- STAMP --}}
                <td class="footer-right">

                    <div class="stamp-wrapper">

                        <div class="stamp-text">
                            <div class="top">
                                Dibuat oleh :
                            </div>

                            <div class="bottom">
                                Admin Payroll
                            </div>
                        </div>

                        <img
                            src="{{ public_path('logo/logo_gaji.jpg') }}"
                            class="stamp-image"
                        >

                    </div>

                </td>

            </tr>
        </table>

    </div>

</body>
</html>