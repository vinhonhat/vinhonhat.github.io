/**
 * THUẬT TOÁN TÍNH ÂM LỊCH VIỆT NAM (Dựa trên thuật toán Hồ Ngọc Đức)
 * Đã được tối ưu hóa để tích hợp vào blog cá nhân.
 * Cung cấp hàm global: convertLunarToSolar(lunarDay, lunarMonth, lunarYear)
 */

(function(root) {
    // Các hằng số thiên văn
    const J1900 = 2415020.5;
    const PI = Math.PI;

    function jdFromDate(dd, mm, yy) {
        let a = Math.floor((14 - mm) / 12);
        let y = yy + 4800 - a;
        let m = mm + 12 * a - 3;
        let jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
        return jd;
    }

    function jdToDate(jd) {
        let a = jd + 32044;
        let b = Math.floor((4 * a + 3) / 146097);
        let c = a - Math.floor((146097 * b) / 4);
        let d = Math.floor((4 * c + 3) / 1461);
        let e = c - Math.floor((1461 * d) / 4);
        let m = Math.floor((5 * e + 2) / 153);
        let day = e - Math.floor((153 * m + 2) / 5) + 1;
        let month = m + 3 - 12 * Math.floor(m / 10);
        let year = 100 * b + d - 4800 + Math.floor(m / 10);
        return { day: day, month: month, year: year };
    }

    function getNewMoonDay(k, timeZone) {
        let T = k / 1236.85;
        let T2 = T * T;
        let T3 = T2 * T;
        let dr = PI / 180;
        let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
        let M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
        let Mprime = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
        let F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
        let C1 = (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * M * dr);
        let C2 = -0.4068 * Math.sin(Mprime * dr) + 0.0161 * Math.sin(2 * Mprime * dr);
        let C3 = -0.0004 * Math.sin(F * dr);
        let JdNew = Jd1 + C1 + C2 + C3 - (0.4072 + 0.009 * T) * Math.sin((Mprime - F) * dr); // Correction for eclipse
        return Math.floor(JdNew + 0.5 + timeZone / 24);
    }

    function getSunLongitude(jdn, timeZone) {
        let T = (jdn - 2451545.0 + 0.5 - timeZone / 24) / 36525;
        let T2 = T * T;
        let dr = PI / 180;
        let M = 357.52910 + 35999.05030 * T - 0.0001559 * T2 - 0.00000048 * T2 * T;
        let L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
        let DL = (1.914600 - 0.004817 * T - 0.000014 * T2) * Math.sin(M * dr) +
                 (0.019993 - 0.000101 * T) * Math.sin(2 * M * dr) + 0.000290 * Math.sin(3 * M * dr);
        let L = L0 + DL;
        return (L * dr - PI * 2 * Math.floor(L * dr / (PI * 2))) / dr * 180 / PI; // Normalized to 0-360 deg
    }

    function getLunarMonth11(yy, timeZone) {
        let off = jdFromDate(31, 12, yy) - 2415021;
        let k = Math.floor(off / 29.530588853);
        let nm = getNewMoonDay(k, timeZone);
        let sunLong = getSunLongitude(nm, timeZone);
        if (sunLong >= 270) {
            nm = getNewMoonDay(k - 1, timeZone);
        }
        return nm;
    }

    function getLeapMonthOffset(a11, timeZone) {
        let k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
        let last = 0;
        let i = 1;
        let arc = getSunLongitude(getNewMoonDay(k, timeZone), timeZone);
        for (; i < 13; i++) {
            let ld = getNewMoonDay(k + i, timeZone);
            let arcNew = getSunLongitude(ld, timeZone);
            last = ld;
            if (Math.floor(arcNew / 30) === Math.floor(arc / 30)) {
                return i;
            }
            arc = arcNew;
        }
        return 0;
    }

    // Hàm chuyển đổi từ Dương Lịch sang Âm Lịch (dùng nội bộ để verify)
    function convertSolar2Lunar(dd, mm, yy, timeZone) {
        let jdn = jdFromDate(dd, mm, yy);
        let k = Math.floor((jdn - 2415021.076998695) / 29.530588853);
        let monthStart = getNewMoonDay(k + 1, timeZone);
        if (monthStart > jdn) {
            monthStart = getNewMoonDay(k, timeZone);
        }
        let a11 = getLunarMonth11(yy, timeZone);
        let b11 = a11;
        if (a11 >= monthStart) {
            a11 = getLunarMonth11(yy - 1, timeZone);
        }
        let day = jdn - monthStart + 1;
        let diff = Math.floor((monthStart - a11) / 29);
        let leap = getLeapMonthOffset(a11, timeZone);
        let month = diff + 11;
        if (leap > 0 && diff >= leap) {
            month = diff + 10;
        }
        if (month > 12) month = month - 12;
        if (month >= 11 && diff < 4) {
            yy -= 1; // Lunar year is earlier
        }
        let isLeap = (diff === leap);
        return { day: day, month: month, year: yy, isLeap: isLeap };
    }

    // --- HÀM CHÍNH: CHUYỂN TỪ ÂM LỊCH SANG DƯƠNG LỊCH ---
    // Đây là hàm mà holidays.js của bạn cần gọi
    function convertLunarToSolar(lunarDay, lunarMonth, lunarYear) {
        // Múi giờ Việt Nam là +7
        const TIME_ZONE = 7.0; 
        
        // Dự đoán ngày dương lịch (Năm âm lịch thường bắt đầu trễ hơn dương lịch khoảng 20-40 ngày)
        // Ta ước lượng ngày dương bắt đầu kiểm tra
        let estimatedSolarYear = lunarYear;
        // Tháng âm luôn lệch so với tháng dương, ta bắt đầu dò từ ngày 1 tháng lunarMonth của năm solar tương ứng
        let jdnStart = jdFromDate(1, 1, estimatedSolarYear);
        
        // Tuy nhiên, để chính xác, ta dùng cách tìm tháng 11 âm lịch của năm trước đó
        // Sau đó cộng dần số tháng để tìm ra ngày Sóc (mùng 1) của tháng cần tìm.
        
        let a11 = getLunarMonth11(lunarYear - 1, TIME_ZONE);
        let leap = getLeapMonthOffset(a11, TIME_ZONE);
        
        let offset = lunarMonth - 11; 
        if (offset < 0) offset += 12; // Nếu tháng < 11, nó thuộc chu kỳ sau tháng 11 năm ngoái
        
        // Nếu năm đó có nhuận và tháng cần tìm sau tháng nhuận, ta phải cộng thêm 1 tháng vào độ lệch
        if (leap > 0 && lunarMonth > leap) {
             // Logic phức tạp của tháng nhuận: 
             // Nếu user không chỉ định là tháng nhuận, ta mặc định tìm tháng chính.
             // Nếu tháng người dùng nhập > tháng nhuận của năm đó, tức là nó nằm sau tháng nhuận
             // Do đó số tháng trăng thực tế phải cộng thêm 1.
        }
        // *Lưu ý: Hàm này đang đơn giản hóa việc tìm tháng nhuận cụ thể. 
        // Với mục đích holidays.js (tìm ngày lễ cố định), ta thường không rơi vào tháng nhuận (ít lễ chính).*

        // Cách tiếp cận "Brute-force" thông minh (An toàn và chính xác nhất cho Vạn Niên):
        // 1. Tính ngày Dương lịch tương ứng với ngày 1/[lunarMonth]/[lunarYear] (ước lượng)
        // 2. Chuyển ngược lại sang Âm lịch để kiểm tra.
        // 3. Điều chỉnh sai số.

        // Ước lượng JDN bắt đầu: Ngày 1 âm năm đó ~ cuối tháng 1 dương hoặc tháng 2 dương
        // Ta bắt đầu dò từ ngày 15 tháng 1 năm SolarYear (trừ hao)
        let k = Math.floor((lunarYear - 1900) * 12.3685) + lunarMonth; 
        let guessJDN = getNewMoonDay(k, TIME_ZONE);
        
        // Dò xung quanh ngày dự đoán (trong phạm vi +/- 60 ngày là đủ bao phủ cả tháng nhuận)
        // Để tìm chính xác ngày mùng 1 của tháng âm lịch đó
        let foundJDN = 0;
        
        // Tìm ngày mùng 1 của tháng âm này
        // Ta lùi lại 2 tháng (khoảng 60 ngày) để quét lên, đảm bảo không sót
        let startScan = guessJDN - 60; 
        
        for (let i = 0; i < 120; i++) {
            let j = startScan + i;
            let res = convertSolar2Lunar(jdToDate(j).day, jdToDate(j).month, jdToDate(j).year, TIME_ZONE);
            
            if (res.year === lunarYear && res.month === lunarMonth && res.day === 1 && !res.isLeap) {
                // Đã tìm thấy ngày mùng 1 của tháng cần tìm (không phải tháng nhuận)
                foundJDN = j;
                break;
            }
        }

        if (foundJDN === 0) {
            // Trường hợp không tìm thấy (hiếm gặp), fallback về công thức cũ
            return null;
        }

        // Ngày cần tìm = Ngày mùng 1 + (lunarDay - 1)
        let targetJDN = foundJDN + (lunarDay - 1);
        let solarDateObj = jdToDate(targetJDN);

        return new Date(solarDateObj.year, solarDateObj.month - 1, solarDateObj.day);
    }

    // Export hàm ra global scope để các file khác (holidays.js) gọi được
    root.convertLunarToSolar = convertLunarToSolar;

})(window);