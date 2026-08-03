(() => {
    'use strict';
    const fireworks = new Set(['tet', '0101', '0430', '0902']);
    const messages = {
        '0101': 'Chúc mừng năm mới! Chúc anh và gia đình sức khỏe, bình an và nhiều thành công.',
        'tet': 'Kính chúc năm mới an khang, thịnh vượng, gia đình sum vầy và vạn sự như ý.',
        '0203': 'Chúc mừng ngày thành lập Đảng Cộng sản Việt Nam.',
        '0227': 'Kính chúc đội ngũ y, bác sĩ luôn mạnh khỏe và vững tâm với nghề.',
        '0308': 'Chúc một nửa thế giới luôn xinh đẹp, hạnh phúc và được yêu thương.',
        '0310': 'Hướng về cội nguồn, tưởng nhớ công lao dựng nước của các Vua Hùng.',
        '0326': 'Chúc tuổi trẻ Việt Nam luôn nhiệt huyết, sáng tạo và tiên phong.',
        '0430': 'Mừng ngày Giải phóng miền Nam, thống nhất đất nước 30/4. Kính chúc mọi gia đình bình an và hạnh phúc.',
        '0501': 'Chúc mừng Ngày Quốc tế Lao động 1/5. Chúc anh và gia đình có kỳ nghỉ vui vẻ và nhiều năng lượng.',
        '0519': 'Kỷ niệm ngày sinh Chủ tịch Hồ Chí Minh kính yêu.',
        '0601': 'Chúc các em nhỏ luôn khỏe mạnh, vui tươi và có một tuổi thơ thật đẹp.',
        '0727': 'Thành kính tưởng nhớ và tri ân các anh hùng liệt sĩ, thương binh và người có công.',
        '0815': 'Chúc gia đình một mùa Trung Thu đoàn viên, ấm áp và tràn đầy tiếng cười.',
        '0902': 'Mừng Quốc khánh Việt Nam. Chúc quê hương ngày càng phát triển và phồn vinh.',
        '1020': 'Chúc phụ nữ Việt Nam luôn tự tin, rạng rỡ, hạnh phúc và thành công.',
        '1119': 'Chúc phái mạnh luôn mạnh khỏe, bản lĩnh và được trân trọng.',
        '1120': 'Kính chúc các thầy cô luôn mạnh khỏe, hạnh phúc và giữ mãi ngọn lửa nghề.',
        '1124': 'Tôn vinh những giá trị văn hóa Việt Nam tốt đẹp trong cộng đồng.',
        '1222': 'Kính chúc các chiến sĩ luôn mạnh khỏe, vững vàng và hoàn thành tốt nhiệm vụ.',
        '1224': 'Chúc một mùa Giáng Sinh an lành, ấm áp và ngập tràn yêu thương.'
    };
    const items = [
        [1, 1, false, 'Tết Dương Lịch', '0101'],
        [1, 1, true, 'Tết Nguyên Đán', 'tet'],
        [3, 2, false, 'Thành lập Đảng Cộng sản Việt Nam', '0203'],
        [27, 2, false, 'Ngày Thầy thuốc Việt Nam', '0227'],
        [8, 3, false, 'Ngày Quốc tế Phụ nữ', '0308'],
        [10, 3, true, 'Giỗ Tổ Hùng Vương', '0310'],
        [26, 3, false, 'Thành lập Đoàn TNCS Hồ Chí Minh', '0326'],
        [30, 4, false, 'Giải phóng miền Nam 30/4', '0430'],
        [1, 5, false, 'Ngày Quốc tế Lao động 1/5', '0501'],
        [19, 5, false, 'Ngày sinh Chủ tịch Hồ Chí Minh', '0519'],
        [1, 6, false, 'Ngày Quốc tế Thiếu nhi', '0601'],
        [27, 7, false, 'Ngày Thương binh Liệt sĩ', '0727'],
        [15, 8, true, 'Tết Trung Thu', '0815'],
        [2, 9, false, 'Quốc khánh Việt Nam', '0902'],
        [20, 10, false, 'Ngày Phụ nữ Việt Nam', '1020'],
        [19, 11, false, 'Ngày Quốc tế Nam giới', '1119'],
        [20, 11, false, 'Ngày Nhà giáo Việt Nam', '1120'],
        [24, 11, false, 'Ngày Văn hóa Việt Nam', '1124'],
        [22, 12, false, 'Thành lập Quân đội Nhân dân Việt Nam', '1222'],
        [24, 12, false, 'Lễ Giáng Sinh', '1224']
    ];
    window.VINH_HOLIDAYS = items.map(([day, month, isLunar, name, imagePrefix]) => ({
        day, month, isLunar, name, imagePrefix,
        message: messages[imagePrefix] || 'Chúc anh và gia đình một ngày thật nhiều niềm vui, bình an và ý nghĩa.',
        fireworks: fireworks.has(imagePrefix)
    }));
})();
