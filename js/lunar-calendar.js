/**
 * ÂM LỊCH VIỆT NAM – CHUẨN QUỐC GIA V26.1.9.1
 * Thuật toán: Hồ Ngọc Đức
 * Múi giờ: GMT+7
 * Hỗ trợ đầy đủ tháng nhuận – không lệch ngày
 */

console.log("LUNAR CALENDAR: VIETNAM NATIONAL STANDARD LOADED");

(function (root) {
    const PI = Math.PI;
    const TZ = 7;

    /* ================== JULIAN DAY ================== */

    function jdFromDate(dd, mm, yy) {
        const a = Math.floor((14 - mm) / 12);
        const y = yy + 4800 - a;
        const m = mm + 12 * a - 3;
        return (
            dd +
            Math.floor((153 * m + 2) / 5) +
            365 * y +
            Math.floor(y / 4) -
            Math.floor(y / 100) +
            Math.floor(y / 400) -
            32045
        );
    }

    function jdToDate(jd) {
        const a = jd + 32044;
        const b = Math.floor((4 * a + 3) / 146097);
        const c = a - Math.floor((146097 * b) / 4);
        const d = Math.floor((4 * c + 3) / 1461);
        const e = c - Math.floor((1461 * d) / 4);
        const m = Math.floor((5 * e + 2) / 153);

        return {
            day: e - Math.floor((153 * m + 2) / 5) + 1,
            month: m + 3 - 12 * Math.floor(m / 10),
            year: 100 * b + d - 4800 + Math.floor(m / 10)
        };
    }

    /* ================== ASTRONOMY ================== */

    function getNewMoonDay(k) {
        const T = k / 1236.85;
        const T2 = T * T;
        const T3 = T2 * T;
        const dr = PI / 180;

        const Jd1 =
            2415020.75933 +
            29.53058868 * k +
            0.0001178 * T2 -
            0.000000155 * T3;

        const M =
            359.2242 +
            29.10535608 * k -
            0.0000333 * T2 -
            0.00000347 * T3;

        const Mpr =
            306.0253 +
            385.81691806 * k +
            0.0107306 * T2 +
            0.00001236 * T3;

        const F =
            21.2964 +
            390.67050646 * k -
            0.0016528 * T2 -
            0.00000239 * T3;

        const C =
            (0.1734 - 0.000393 * T) * Math.sin(M * dr) +
            0.0021 * Math.sin(2 * M * dr) -
            0.4068 * Math.sin(Mpr * dr) +
            0.0161 * Math.sin(2 * Mpr * dr) -
            0.0004 * Math.sin(F * dr);

        return Math.floor(Jd1 + C + 0.5 + TZ / 24);
    }

    function getSunLongitude(jdn) {
        const T = (jdn - 2451545.5 - TZ / 24) / 36525;
        const T2 = T * T;
        const dr = PI / 180;

        const M =
            357.52910 +
            35999.05030 * T -
            0.0001559 * T2 -
            0.00000048 * T * T2;

        const L0 =
            280.46645 +
            36000.76983 * T +
            0.0003032 * T2;

        const DL =
            (1.914600 - 0.004817 * T - 0.000014 * T2) *
                Math.sin(M * dr) +
            (0.019993 - 0.000101 * T) *
                Math.sin(2 * M * dr) +
            0.000290 * Math.sin(3 * M * dr);

        let L = L0 + DL;
        L = L * dr;
        L = L - PI * 2 * Math.floor(L / (PI * 2));
        return Math.floor((L / PI) * 6);
    }

    /* ================== CORE LOGIC ================== */

    function getLunarMonth11(yy) {
        const off = jdFromDate(31, 12, yy) - 2415021;
        const k = Math.floor(off / 29.530588853);
        let nm = getNewMoonDay(k);
        if (getSunLongitude(nm) >= 9) {
            nm = getNewMoonDay(k - 1);
        }
        return nm;
    }

    function getLeapMonthOffset(a11) {
        const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
        let last = getSunLongitude(getNewMoonDay(k));
        for (let i = 1; i < 14; i++) {
            const arc = getSunLongitude(getNewMoonDay(k + i));
            if (arc === last) return i;
            last = arc;
        }
        return 0;
    }

    /* ================== SOLAR → LUNAR ================== */

    function getLunarDate(dd, mm, yy) {
        const jdn = jdFromDate(dd, mm, yy);
        const k = Math.floor((jdn - 2415021.076998695) / 29.530588853);

        let monthStart = getNewMoonDay(k + 1);
        if (monthStart > jdn) {
            monthStart = getNewMoonDay(k);
        }

        let a11 = getLunarMonth11(yy);
        let b11 = a11;

        if (a11 >= monthStart) {
            a11 = getLunarMonth11(yy - 1);
        } else {
            b11 = getLunarMonth11(yy + 1);
        }

        const day = jdn - monthStart + 1;
        const diff = Math.floor((monthStart - a11) / 29);

        let month = diff + 11;
        let leap = false;

        const leapMonthDiff = getLeapMonthOffset(a11);

        if (leapMonthDiff > 0 && diff >= leapMonthDiff) {
            month = diff + 10;
            if (diff === leapMonthDiff) {
                leap = true;
            }
        }

        if (month > 12) month -= 12;
        if (month >= 11 && diff < 4) yy--;

        return {
            day,
            month,
            year: yy,
            leap
        };
    }

    /* ================== LUNAR → SOLAR (ĐÃ SỬA ĐỂ HIỆN PHÁO HOA) ================== */

    function convertLunarToSolar(ld, lm, ly, isLeap) {
        // --- DÒNG SỬA QUAN TRỌNG ---
        // Nếu bên pháo hoa không gửi 'isLeap', ta tự hiểu là tháng chính (false)
        if (isLeap === undefined) isLeap = false; 
        // ---------------------------

        const from = new Date(ly - 1, 11, 15);
        // Tăng giới hạn quét lên một chút để an toàn
        for (let i = 0; i < 400; i++) {
            const d = from.getDate();
            const m = from.getMonth() + 1;
            const y = from.getFullYear();

            const lunar = getLunarDate(d, m, y);

            if (
                lunar.day === ld &&
                lunar.month === lm &&
                lunar.year === ly &&
                lunar.leap === isLeap
            ) {
                return new Date(y, m - 1, d);
            }
            from.setDate(from.getDate() + 1);
        }
        return null;
    }

    /* ================== EXPORT ================== */

    root.getLunarDate = getLunarDate;
    root.convertLunarToSolar = convertLunarToSolar;

})(window);
