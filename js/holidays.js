(() => {
    'use strict';
    const fireworks = new Set(['tet', '0101', '0430', '0902']);
    const items = [
        [1, 1, false, 'Tết Dương Lịch', '0101'],
        [1, 1, true, 'Tết Nguyên Đán', 'tet'],
        [3, 2, false, 'Thành lập Đảng Cộng sản Việt Nam', '0203'],
        [27, 2, false, 'Ngày Thầy thuốc Việt Nam', '0227'],
        [8, 3, false, 'Ngày Quốc tế Phụ nữ', '0308'],
        [10, 3, true, 'Giỗ Tổ Hùng Vương', '0310'],
        [26, 3, false, 'Thành lập Đoàn TNCS Hồ Chí Minh', '0326'],
        [30, 4, false, 'Giải phóng miền Nam và Quốc tế Lao động', '0430'],
        [19, 5, false, 'Ngày sinh Chủ tịch Hồ Chí Minh', '0519'],
        [1, 6, false, 'Ngày Quốc tế Thiếu nhi', '0601'],
        [27, 7, false, 'Ngày Thương binh Liệt sĩ', '0727'],
        [15, 8, true, 'Tết Trung Thu', '0815'],
        [2, 9, false, 'Quốc khánh Việt Nam', '0902'],
        [20, 10, false, 'Ngày Phụ nữ Việt Nam', '1020'],
        [9, 11, false, 'Ngày Quốc tế Nam giới', '1109'],
        [20, 11, false, 'Ngày Nhà giáo Việt Nam', '1120'],
        [24, 11, false, 'Ngày Văn hóa Việt Nam', '1124'],
        [22, 12, false, 'Thành lập Quân đội Nhân dân Việt Nam', '1222'],
        [24, 12, false, 'Lễ Giáng Sinh', '1224']
    ];
    window.VINH_HOLIDAYS = items.map(([day, month, isLunar, name, imagePrefix]) => ({
        day, month, isLunar, name, imagePrefix, fireworks: fireworks.has(imagePrefix)
    }));
})();
