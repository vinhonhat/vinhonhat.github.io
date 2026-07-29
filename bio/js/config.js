/*
  HƯỚNG DẪN NHANH
  1. Đổi enabled: false thành enabled: true để hiện một mục.
  2. Thay url, title, description theo thông tin của Anh.
  3. Không cần sửa index.html hoặc style.css.
*/

window.BIO_CONFIG = {
  profile: {
    name: "Vinh ở Nhật",
    handle: "@vinhonhat",
    bio: "Chia sẻ cuộc sống, công nghệ và những tiện ích hữu ích tại Nhật Bản.",
    avatar: "assets/avatar.svg",
    footerText: "Vinh ở Nhật • Made with ❤️",
    badges: [
      { icon: "map-pin", text: "Tokyo, Nhật Bản" },
      { icon: "sparkles", text: "Chia sẻ hữu ích" }
    ]
  },

  settings: {
    defaultTheme: "auto", // auto | light | dark
    showThemeButton: true,
    showShareButton: true,
    showQrButton: true,
    openLinksInNewTab: true,
    qrUrl: "", // Để trống sẽ tự lấy URL trang hiện tại
    announcement: {
      enabled: false,
      icon: "bell",
      text: "Nội dung thông báo mới sẽ hiển thị ở đây."
    }
  },

  links: [
    {
      enabled: true,
      featured: true,
      icon: "globe",
      title: "Website Vinh ở Nhật",
      description: "Bài viết, hướng dẫn và tiện ích mới nhất",
      url: "https://vinhonhat.github.io/",
      badge: "Nổi bật"
    },
    {
      enabled: true,
      icon: "book-open",
      title: "Bé Vui Học",
      description: "Kho trò chơi học tập dành cho bé",
      url: "https://vinhonhat.github.io/behoc/"
    },
    {
      enabled: true,
      icon: "download",
      title: "Tải công cụ miễn phí",
      description: "Phần mềm và công cụ do Vinh chia sẻ",
      url: "https://vinhonhat.github.io/#download"
    },
    {
      enabled: false,
      icon: "facebook",
      title: "Facebook",
      description: "Trang Facebook chính thức",
      url: "https://facebook.com/THAY-LINK-CUA-ANH"
    },
    {
      enabled: false,
      icon: "message-circle",
      title: "Facebook Messenger",
      description: "Nhắn tin trực tiếp qua Messenger",
      url: "https://m.me/THAY-TEN-NGUOI-DUNG"
    },
    {
      enabled: false,
      icon: "music-2",
      title: "TikTok",
      description: "Video ngắn và chia sẻ cuộc sống tại Nhật",
      url: "https://www.tiktok.com/@THAY-TEN-TAI-KHOAN"
    },
    {
      enabled: false,
      icon: "youtube",
      title: "YouTube",
      description: "Video hướng dẫn và trải nghiệm",
      url: "https://youtube.com/@THAY-KENH-CUA-ANH"
    },
    {
      enabled: false,
      icon: "phone",
      title: "Số điện thoại",
      description: "Nhấn để gọi trực tiếp",
      url: "tel:+81XXXXXXXXXX"
    },
    {
      enabled: false,
      icon: "message-square",
      title: "Zalo",
      description: "Liên hệ với tôi trên Zalo",
      url: "https://zalo.me/84XXXXXXXXX"
    },
    {
      enabled: false,
      icon: "message-circle-more",
      title: "LINE",
      description: "Kết bạn hoặc nhắn tin qua LINE",
      url: "https://line.me/ti/p/~THAY-LINE-ID"
    },
    {
      enabled: false,
      icon: "mail",
      title: "Email",
      description: "Gửi email liên hệ",
      url: "mailto:email@example.com"
    },
    {
      enabled: false,
      icon: "map",
      title: "Địa chỉ cửa hàng",
      description: "Mở chỉ đường trên Google Maps",
      url: "https://maps.google.com/?q=THAY-DIA-CHI"
    }
  ],

  socialIcons: [
    { enabled: false, icon: "facebook", label: "Facebook", url: "https://facebook.com/THAY-LINK-CUA-ANH" },
    { enabled: false, icon: "music-2", label: "TikTok", url: "https://www.tiktok.com/@THAY-TEN-TAI-KHOAN" },
    { enabled: false, icon: "youtube", label: "YouTube", url: "https://youtube.com/@THAY-KENH-CUA-ANH" },
    { enabled: false, icon: "message-square", label: "Zalo", url: "https://zalo.me/84XXXXXXXXX" },
    { enabled: false, icon: "message-circle-more", label: "LINE", url: "https://line.me/ti/p/~THAY-LINE-ID" },
    { enabled: false, icon: "mail", label: "Email", url: "mailto:email@example.com" }
  ]
};
