// script.js (Phiên bản ĐÃ SỬA LỖI CÚ PHÁP và logic format)

// KHAI BÁO BIẾN TOÀN CỤC
const HOMEPAGE_URL = "/index.html"; // Giả định file chuyển hướng là homepage.html
let userData = null;
let DOB_INPUT; 
let ERROR_MESSAGE_DISPLAY;
let PENDING_WISH = null; // Biến mới để lưu lời chúc tạm thời

// ------------------------------------------------------------------
// BỌC TẤT CẢ LOGIC GIAO DIỆN TRONG SỰ KIỆN DOMContentLoaded
// ------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', (event) => {
    // Gán giá trị cho các phần tử sau khi DOM đã sẵn sàng
    DOB_INPUT = document.getElementById('dob-input');
    ERROR_MESSAGE_DISPLAY = document.getElementById('error-message');

    // 1. Logic Format Input (Chỉ tự động thêm '0' cho THÁNG)
    if (DOB_INPUT) {
        DOB_INPUT.addEventListener('input', function(e) {
            let value = e.target.value.replace(/[^0-9]/g, ''); 
            let formattedValue = '';
            const input = e.target;
            
            // Xây dựng chuỗi format cơ bản
            if (value.length > 0) {
                formattedValue += value.substring(0, 2); 
            }
            if (value.length >= 3) {
                formattedValue += '/' + value.substring(2, 4); 
            }
            if (value.length >= 5) {
                formattedValue += '/' + value.substring(4, 8); 
            }
            
            // --- Logic Tự động thêm '0' cho THÁNG (2-9) ---
            if (value.length === 3) {
                const dayPart = value.substring(0, 2);
                const monthFirstDigit = value[2];
                
                if (monthFirstDigit >= '2' && monthFirstDigit <= '9') {
                     formattedValue = dayPart + '/0' + monthFirstDigit + '/';
                }
            }
            
            input.value = formattedValue;
        });
    }
    
    // Gán hàm checkData và handleConfirm vào đối tượng window
    window.checkData = checkData;
    window.handleConfirm = handleConfirm; // Cần phải gán hàm này!
});

// ------------------------------------------------------------------
// 2. Tải Dữ Liệu (loadData() giữ nguyên)
// ------------------------------------------------------------------

async function loadData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        userData = await response.json();
    } catch (e) {
        console.error("Lỗi khi tải data.json:", e);
        if (ERROR_MESSAGE_DISPLAY) {
            ERROR_MESSAGE_DISPLAY.textContent = "LỖI: Không tải được file cấu hình data.json.";
        }
    }
}

// ------------------------------------------------------------------
// 3. Logic Xử lý Mật Khẩu (Đã sửa logic lời chúc)
// ------------------------------------------------------------------

async function checkData() {
    if (!ERROR_MESSAGE_DISPLAY) { return; } 

    // Ẩn hộp thoại xác nhận nhỏ nếu nó đang hiện và hiện lại input
    document.getElementById('small-confirm').style.display = 'none';
    document.getElementById('main-input').style.display = 'block';

    if (!userData) {
        ERROR_MESSAGE_DISPLAY.textContent = "Đang tải dữ liệu...";
        await loadData();
    }

    if (!userData) {
         ERROR_MESSAGE_DISPLAY.textContent = "Dữ liệu chưa sẵn sàng. Vui lòng thử lại.";
         return;
    }

    const dobInput = DOB_INPUT.value.trim();
    ERROR_MESSAGE_DISPLAY.textContent = "";
    
    const dobRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    if (!dobRegex.test(dobInput)) {
        ERROR_MESSAGE_DISPLAY.textContent = "Vui lòng nhập đúng định dạng Ngày/Tháng/Năm (vd: 20/10/1990)";
        return;
    }

    const [day, month, year] = dobInput.match(dobRegex).slice(1);
    const standardizedDOB = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
    const birthDateOnly = `${day.padStart(2, '0')}/${month.padStart(2, '0')}`;

    // 1. Ưu tiên Lời chúc Cá nhân
    const personalizedUser = userData.users.find(u => u.dob === standardizedDOB);

    if (personalizedUser) {
        showPopup(personalizedUser.wish);
        return;
    }

    // 2. Không có trong danh sách cá nhân -> Chuẩn bị Lời chúc Chung
    
    const today = new Date();
    const currentDay = today.getDate().toString().padStart(2, '0');
    const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
    const todayDateOnly = `${currentDay}/${currentMonth}`;

    let finalWish = null; 

    // BƯỚC 2A: Kiểm tra Ngày Lễ HÔM NAY (Ưu tiên thấp hơn Sinh nhật)
    const holiday = userData.holidays.find(h => h.date === todayDateOnly);
    if (holiday) {
        finalWish = holiday.wish; 
    }

    // BƯỚC 2B: Kiểm tra Sinh Nhật HÔM NAY (Ưu tiên cao nhất)
    if (birthDateOnly === todayDateOnly) { 
        finalWish = userData.birthdayWish; 
    } 

    // 3. Hiển thị hộp thoại xác nhận nhỏ gọn (thay vì confirm)
    PENDING_WISH = finalWish || userData.defaultWish;
    
    document.getElementById('dob-display').textContent = dobInput;
    document.getElementById('main-input').style.display = 'none'; // Ẩn phần nhập liệu chính
    document.getElementById('small-confirm').style.display = 'block'; // Hiện hộp thoại xác nhận nhỏ
    document.getElementById('temp-message').textContent = "";
}

// ------------------------------------------------------------------
// HÀM XỬ LÝ NÚT XÁC NHẬN/HỦY
// ------------------------------------------------------------------
function handleConfirm(isConfirmed) {
    document.getElementById('main-input').style.display = 'block';
    document.getElementById('small-confirm').style.display = 'none';
    
    if (isConfirmed && PENDING_WISH) {
        showPopup(PENDING_WISH);
    } else {
        ERROR_MESSAGE_DISPLAY.textContent = "Vui lòng kiểm tra lại Ngày/Tháng/Năm Sinh.";
    }
}


// ------------------------------------------------------------------
// 4. Logic Hiển Thị và Hẹn Giờ
// ------------------------------------------------------------------

function showPopup(wishText) {
    document.getElementById('wish-message').innerHTML = wishText;
    document.getElementById('popup-overlay').style.display = 'flex';
    document.getElementById('login-container').style.display = 'none'; 

    startRedirectTimer();
}

function startRedirectTimer() {
    let timeLeft = 20;
    const timerDisplay = document.getElementById('timer');

    const redirect = () => {
        window.location.href = HOMEPAGE_URL;
    };

    const countdown = () => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            redirect();
        } else {
            timerDisplay.textContent = timeLeft;
            timeLeft--;
        }
    };

    countdown(); 
    const timerInterval = setInterval(countdown, 1000); 
}