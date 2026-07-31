/* Cấu hình Bio Link V1.6.10 */
window.BIO_CONFIG = {
  "profile": {
    "name": "Duyên",
    "verified": true,
    "handle": "@duyen",
    "bio": "Trang liên kết của Duyên. Nhấn logo để mở cài đặt và thay nội dung.",
    "avatar": "avatar.png",
    "footerText": "Duyên • Bio Link",
    "badges": [
      {
        "enabled": true,
        "icon": "map-pin",
        "text": "Tokyo, Nhật Bản",
        "translations": {
          "ja": {
            "text": "東京、日本"
          },
          "en": {
            "text": "Tokyo, Japan"
          }
        }
      },
      {
        "enabled": true,
        "icon": "sparkles",
        "text": "Chia sẻ hữu ích",
        "translations": {
          "ja": {
            "text": "役立つ情報"
          },
          "en": {
            "text": "Useful sharing"
          }
        }
      }
    ],
    "favicon": "avatar.png",
    "translations": {
      "ja": {
        "name": "ズエン",
        "bio": "ズエンのリンクページです。",
        "footerText": "ズエン • Bio Link"
      },
      "en": {
        "name": "Duyen",
        "bio": "This is Duyen's link page.",
        "footerText": "Duyen • Bio Link"
      }
    }
  },
  "admin": {
    "enabled": true,
    "logoGestureMode": "tap-cache-hold-admin",
    "logoTapCount": 2,
    "logoHoldSeconds": 2,
    "logoRingDelaySeconds": 0.6,
    "tapTimeout": 2500,
    "storageKey": "vinh-bio-admin-config-v168",
    "passwordHash": "5f3c731b478c8292b603e6dec59aaa2626f6fcb3c6d5e97bc3a844b8dc4e279b",
    "serverSave": {
      "enabled": false,
      "endpoint": "api/save-config.php"
    },
    "mode": "embedded",
    "version": "V1.7.0"
  },
  "settings": {
    "defaultTheme": "auto",
    "showThemeButton": true,
    "showShareButton": true,
    "showQrButton": true,
    "openLinksInNewTab": true,
    "qrUrl": "",
    "announcement": {
      "enabled": false,
      "icon": "bell",
      "text": "Nội dung thông báo mới sẽ hiển thị ở đây.",
      "translations": {
        "ja": {
          "text": ""
        },
        "en": {
          "text": ""
        }
      }
    },
    "layout": {
      "mobileColumns": 2,
      "tabletColumns": 2,
      "desktopColumns": 2
    },
    "appearance": {
      "primaryColor": "#f39b19",
      "primaryStrongColor": "#d97800",
      "lightTextColor": "#2c2118",
      "lightMutedColor": "#77695c",
      "darkTextColor": "#fff8ef",
      "darkMutedColor": "#c7b8a7",
      "nameFontSize": 32,
      "bioFontSize": 15,
      "linkTitleFontSize": 15,
      "linkDescriptionFontSize": 12,
      "footerFontSize": 12,
      "outerLightColor": "#fff8ed",
      "outerDarkColor": "#16120d",
      "innerLightColor": "#fffaf2",
      "innerDarkColor": "#221c15",
      "outerBackgroundImage": "",
      "innerBackgroundImage": "",
      "lightBorderColor": "#f39b19",
      "darkBorderColor": "#f39b19",
      "showDecorations": true,
      "showCardBorder": true
    },
    "showLanguageButton": true,
    "defaultLanguage": "auto",
    "languageFlags": {
      "vi": "assets/flag-vi.svg",
      "ja": "assets/flag-ja.svg",
      "en": "assets/flag-en.svg"
    },
    "qrDesign": {
      "linkPreset": "current-current",
      "colorMode": "solid",
      "color1": "#111111",
      "color2": "#f39b19",
      "backgroundColor": "#ffffff",
      "gradientDirection": "diagonal"
    }
  },
  "links": [
    {
      "enabled": false,
      "icon": "facebook",
      "title": "Facebook",
      "description": "Trang Facebook chính thức",
      "url": "https://facebook.com/tqv2022",
      "image": "assets/fb.webp",
      "badge": "",
      "featured": false,
      "showIconBackground": false,
      "id": "facebook",
      "translations": {
        "ja": {
          "title": "Facebook",
          "description": "公式Facebookページ",
          "badge": ""
        },
        "en": {
          "title": "Facebook",
          "description": "Official Facebook page",
          "badge": ""
        }
      }
    },
    {
      "enabled": false,
      "icon": "message-circle",
      "title": "Messenger",
      "description": "Nhắn tin trực tiếp qua Messenger",
      "url": "https://m.me/tqv2022",
      "image": "assets/mess.webp",
      "badge": "",
      "featured": false,
      "showIconBackground": false,
      "id": "messenger",
      "translations": {
        "ja": {
          "title": "Messenger",
          "description": "Messengerで直接メッセージ",
          "badge": ""
        },
        "en": {
          "title": "Messenger",
          "description": "Message me directly on Messenger",
          "badge": ""
        }
      }
    },
    {
      "enabled": false,
      "icon": "music-2",
      "title": "TikTok",
      "description": "Video ngắn và chia sẻ cuộc sống tại Nhật",
      "url": "https://www.tiktok.com/@tqv2020?_r=1&_t=ZS-98QazQnE1p9",
      "image": "assets/tiktok.webp",
      "badge": "",
      "featured": false,
      "showIconBackground": false,
      "id": "tiktok",
      "translations": {
        "ja": {
          "title": "TikTok",
          "description": "日本での暮らしとショート動画",
          "badge": ""
        },
        "en": {
          "title": "TikTok",
          "description": "Short videos and life in Japan",
          "badge": ""
        }
      }
    },
    {
      "enabled": false,
      "icon": "message-square",
      "title": "Zalo",
      "description": "Liên hệ với tôi trên Zalo",
      "url": "https://zalo.me/84966697926",
      "image": "assets/zalo.webp",
      "badge": "",
      "featured": false,
      "showIconBackground": false,
      "id": "zalo",
      "translations": {
        "ja": {
          "title": "Zalo",
          "description": "Zaloで連絡する",
          "badge": ""
        },
        "en": {
          "title": "Zalo",
          "description": "Contact me on Zalo",
          "badge": ""
        }
      }
    },
    {
      "enabled": false,
      "icon": "message-circle-more",
      "title": "LINE",
      "description": "Kết bạn hoặc nhắn tin qua LINE",
      "url": "https://line.me/ti/p/VNcwANYxzU",
      "image": "assets/line.webp",
      "badge": "",
      "featured": false,
      "showIconBackground": false,
      "id": "line",
      "translations": {
        "ja": {
          "title": "LINE",
          "description": "LINEで友だち追加・メッセージ",
          "badge": ""
        },
        "en": {
          "title": "LINE",
          "description": "Add or message me on LINE",
          "badge": ""
        }
      }
    },
    {
      "enabled": false,
      "featured": false,
      "icon": "globe",
      "title": "Vinh ở Nhật",
      "description": "Bài viết, hướng dẫn và tiện ích mới nhất",
      "url": "https://vinhonhat.github.io/",
      "badge": "",
      "image": "assets/web.webp",
      "showIconBackground": false,
      "id": "website",
      "translations": {
        "ja": {
          "title": "日本のVinh ウェブサイト",
          "description": "最新記事、ガイド、便利なツール",
          "badge": ""
        },
        "en": {
          "title": "Vinh in Japan Website",
          "description": "Latest articles, guides, and useful tools",
          "badge": ""
        }
      }
    },
    {
      "enabled": false,
      "icon": "phone",
      "title": "Số điện thoại",
      "description": "Nhấn để gọi trực tiếp",
      "url": "tel:+81XXXXXXXXXX",
      "image": "assets/phone.webp",
      "badge": "",
      "featured": false,
      "showIconBackground": false,
      "id": "phone",
      "translations": {
        "ja": {
          "title": "電話番号",
          "description": "タップして直接電話",
          "badge": ""
        },
        "en": {
          "title": "Phone number",
          "description": "Tap to call directly",
          "badge": ""
        }
      }
    },
    {
      "enabled": false,
      "icon": "youtube",
      "title": "YouTube",
      "description": "Video hướng dẫn và trải nghiệm",
      "url": "https://youtube.com/@THAY-KENH-CUA-ANH",
      "image": "assets/youtobe.webp",
      "badge": "",
      "featured": false,
      "showIconBackground": false,
      "id": "youtube",
      "translations": {
        "ja": {
          "title": "YouTube",
          "description": "ガイド動画と体験",
          "badge": ""
        },
        "en": {
          "title": "YouTube",
          "description": "Tutorials and experience videos",
          "badge": ""
        }
      }
    },
    {
      "enabled": false,
      "icon": "mail",
      "title": "Email",
      "description": "Gửi email liên hệ",
      "url": "mailto:email@example.com",
      "image": "assets/gmail.webp",
      "badge": "",
      "featured": false,
      "showIconBackground": false,
      "id": "email",
      "translations": {
        "ja": {
          "title": "メール",
          "description": "メールで問い合わせる",
          "badge": ""
        },
        "en": {
          "title": "Email",
          "description": "Send me an email",
          "badge": ""
        }
      }
    },
    {
      "enabled": false,
      "icon": "map",
      "title": "Địa chỉ cửa hàng",
      "description": "Mở chỉ đường trên Google Maps",
      "url": "https://maps.google.com/?q=THAY-DIA-CHI",
      "image": "",
      "badge": "",
      "featured": false,
      "showIconBackground": true,
      "id": "address",
      "translations": {
        "ja": {
          "title": "店舗住所",
          "description": "Googleマップで経路を開く",
          "badge": ""
        },
        "en": {
          "title": "Store address",
          "description": "Open directions in Google Maps",
          "badge": ""
        }
      }
    },
    {
      "enabled": false,
      "icon": "book-open",
      "title": "Bé Vui Học",
      "description": "Kho trò chơi học tập dành cho bé",
      "url": "https://vinhonhat.github.io/behoc/",
      "image": "",
      "badge": "",
      "featured": false,
      "showIconBackground": true,
      "id": "kids-learning",
      "translations": {
        "ja": {
          "title": "楽しく学ぼう",
          "description": "子ども向け学習ゲーム",
          "badge": ""
        },
        "en": {
          "title": "Fun Learning for Kids",
          "description": "Learning games for children",
          "badge": ""
        }
      }
    },
    {
      "enabled": false,
      "icon": "download",
      "title": "Tải công cụ miễn phí",
      "description": "Phần mềm và công cụ do Vinh chia sẻ",
      "url": "https://vinhonhat.github.io/#download",
      "image": "",
      "badge": "",
      "featured": false,
      "showIconBackground": true,
      "id": "downloads",
      "translations": {
        "ja": {
          "title": "無料ツール",
          "description": "Vinhが共有するソフトウェアとツール",
          "badge": ""
        },
        "en": {
          "title": "Free downloads",
          "description": "Software and tools shared by Vinh",
          "badge": ""
        }
      }
    }
  ],
  "socialIcons": [
    {
      "enabled": false,
      "icon": "facebook",
      "label": "Facebook",
      "url": "https://facebook.com/tqv2022",
      "image": "assets/fb.webp",
      "showIconBackground": false,
      "id": "social-1",
      "syncFromLink": false,
      "sourceLinkId": "facebook",
      "translations": {
        "ja": {
          "label": "Facebook"
        },
        "en": {
          "label": "Facebook"
        }
      },
      "brandIcon": "facebook"
    },
    {
      "enabled": false,
      "icon": "message-circle",
      "label": "Messenger",
      "url": "https://m.me/tqv2022",
      "image": "assets/mess.webp",
      "showIconBackground": false,
      "id": "social-messenger",
      "syncFromLink": false,
      "sourceLinkId": "messenger",
      "brandIcon": "messenger",
      "translations": {
        "ja": {
          "label": "Messenger"
        },
        "en": {
          "label": "Messenger"
        }
      }
    },
    {
      "enabled": false,
      "icon": "music-2",
      "label": "TikTok",
      "url": "https://www.tiktok.com/@tqv2020?_r=1&_t=ZS-98QazQnE1p9",
      "image": "assets/tiktok.webp",
      "showIconBackground": false,
      "id": "social-2",
      "syncFromLink": false,
      "sourceLinkId": "tiktok",
      "translations": {
        "ja": {
          "label": "TikTok"
        },
        "en": {
          "label": "TikTok"
        }
      },
      "brandIcon": "tiktok"
    },
    {
      "enabled": false,
      "icon": "message-square",
      "label": "Zalo",
      "url": "https://zalo.me/84966697926",
      "image": "assets/zalo.webp",
      "showIconBackground": false,
      "id": "social-4",
      "syncFromLink": false,
      "sourceLinkId": "zalo",
      "translations": {
        "ja": {
          "label": "Zalo"
        },
        "en": {
          "label": "Zalo"
        }
      },
      "brandIcon": "zalo"
    },
    {
      "enabled": false,
      "icon": "message-circle-more",
      "label": "LINE",
      "url": "https://line.me/ti/p/VNcwANYxzU",
      "image": "assets/line.webp",
      "showIconBackground": false,
      "id": "social-5",
      "syncFromLink": false,
      "sourceLinkId": "line",
      "translations": {
        "ja": {
          "label": "LINE"
        },
        "en": {
          "label": "LINE"
        }
      },
      "brandIcon": "line"
    },
    {
      "enabled": false,
      "icon": "youtube",
      "label": "YouTube",
      "url": "https://youtube.com/@THAY-KENH-CUA-ANH",
      "image": "assets/youtobe.webp",
      "showIconBackground": false,
      "id": "social-3",
      "syncFromLink": false,
      "sourceLinkId": "youtube",
      "translations": {
        "ja": {
          "label": "YouTube"
        },
        "en": {
          "label": "YouTube"
        }
      },
      "brandIcon": "youtube"
    },
    {
      "enabled": false,
      "icon": "mail",
      "label": "Email",
      "url": "mailto:email@example.com",
      "image": "assets/gmail.webp",
      "showIconBackground": false,
      "id": "social-6",
      "syncFromLink": false,
      "sourceLinkId": "email",
      "translations": {
        "ja": {
          "label": "メール"
        },
        "en": {
          "label": "Email"
        }
      },
      "brandIcon": "gmail"
    }
  ]
};
