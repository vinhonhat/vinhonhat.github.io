(() => {
    'use strict';
    const fireworks = new Set(['tet', '0101', '0430', '0902']);
    const messages = {
        '0101': 'Chúc anh và gia đình một năm mới bình an, nhiều sức khỏe và gặp thật nhiều điều may mắn.',
        'tet': 'Kính chúc anh và gia đình năm mới an khang, sum vầy, vạn sự như ý và luôn giữ được niềm vui nơi đất khách.',
        '0203': 'Chúc mừng ngày thành lập Đảng Cộng sản Việt Nam. Kính chúc mọi người luôn mạnh khỏe và đoàn kết.',
        '0227': 'Kính chúc các y, bác sĩ và những người làm trong ngành y luôn mạnh khỏe, tận tâm và nhiều niềm vui.',
        '0308': 'Chúc một nửa thế giới luôn xinh đẹp, hạnh phúc, được yêu thương và thành công trong cuộc sống.',
        '0310': 'Hướng về cội nguồn, kính chúc mọi gia đình Việt luôn bình an, đoàn kết và gìn giữ truyền thống tốt đẹp.',
        '0326': 'Chúc tuổi trẻ Việt Nam luôn nhiệt huyết, sáng tạo và vững bước trên hành trình của mình.',
        '0430': 'Chúc mừng ngày thống nhất đất nước. Kính chúc mọi người một kỳ nghỉ bình an và nhiều niềm vui.',
        '0519': 'Kỷ niệm ngày sinh Chủ tịch Hồ Chí Minh. Kính chúc mọi người luôn giữ tinh thần học tập và sống tốt mỗi ngày.',
        '0601': 'Chúc các bé luôn khỏe mạnh, vui vẻ, chăm ngoan và có một ngày Quốc tế Thiếu nhi thật đáng nhớ.',
        '0727': 'Thành kính tưởng nhớ và tri ân những người đã hy sinh, cống hiến cho Tổ quốc.',
        '0815': 'Chúc anh và gia đình một mùa Trung Thu đoàn viên, ấm áp, nhiều tiếng cười và thật nhiều kỷ niệm đẹp.',
        '0902': 'Chúc mừng Quốc khánh Việt Nam. Kính chúc cộng đồng người Việt tại Nhật luôn bình an, đoàn kết và thành công.',
        '1020': 'Chúc phụ nữ Việt Nam luôn xinh đẹp, hạnh phúc, tự tin và được yêu thương mỗi ngày.',
        '1109': 'Chúc các anh em luôn mạnh khỏe, bản lĩnh, vui vẻ và đạt được nhiều điều mình mong muốn.',
        '1120': 'Kính chúc các thầy cô luôn mạnh khỏe, hạnh phúc và giữ mãi ngọn lửa với sự nghiệp trồng người.',
        '1124': 'Chúc cộng đồng người Việt luôn gìn giữ bản sắc, lan tỏa những giá trị đẹp và gắn kết nơi xa quê.',
        '1222': 'Kính chúc các chiến sĩ và gia đình luôn mạnh khỏe, bình an và hoàn thành tốt mọi nhiệm vụ.',
        '1224': 'Chúc anh và gia đình một mùa Giáng Sinh an lành, ấm áp và tràn đầy niềm vui.'
    };
    const items = [
        [1,1,false,'Tết Dương Lịch','0101'], [1,1,true,'Tết Nguyên Đán','tet'],
        [3,2,false,'Thành lập Đảng Cộng sản Việt Nam','0203'], [27,2,false,'Ngày Thầy thuốc Việt Nam','0227'],
        [8,3,false,'Ngày Quốc tế Phụ nữ','0308'], [10,3,true,'Giỗ Tổ Hùng Vương','0310'],
        [26,3,false,'Thành lập Đoàn TNCS Hồ Chí Minh','0326'], [30,4,false,'Ngày Giải phóng miền Nam','0430'],
        [19,5,false,'Ngày sinh Chủ tịch Hồ Chí Minh','0519'], [1,6,false,'Ngày Quốc tế Thiếu nhi','0601'],
        [27,7,false,'Ngày Thương binh Liệt sĩ','0727'], [15,8,true,'Tết Trung Thu','0815'],
        [2,9,false,'Quốc khánh Việt Nam','0902'], [20,10,false,'Ngày Phụ nữ Việt Nam','1020'],
        [9,11,false,'Ngày Quốc tế Nam giới','1109'], [20,11,false,'Ngày Nhà giáo Việt Nam','1120'],
        [24,11,false,'Ngày Văn hóa Việt Nam','1124'], [22,12,false,'Thành lập Quân đội Nhân dân Việt Nam','1222'],
        [24,12,false,'Lễ Giáng Sinh','1224']
    ];
    window.VINH_HOLIDAYS = items.map(([day,month,isLunar,name,imagePrefix]) => ({
        day, month, isLunar, name, imagePrefix,
        message: messages[imagePrefix] || 'Chúc anh và gia đình có một ngày thật nhiều niềm vui, bình an và ý nghĩa.',
        fireworks: fireworks.has(imagePrefix)
    }));
})();
