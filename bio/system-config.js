/* Nguồn phiên bản và thiết lập hệ thống dùng chung. Chỉ sửa phiên bản tại file này. */
window.BIO_SYSTEM_CONFIG = {
  "version": "V1.7.8-beta",
  "assetVersion": "1.7.8-beta",
  "adminDefaults": {
    "enabled": true,
    "logoGestureMode": "tap-cache-hold-admin",
    "logoTapCount": 2,
    "tapTimeout": 2500,
    "logoHoldSeconds": 2,
    "logoRingDelaySeconds": 0.6,
    "storageKey": "bio-admin-preview",
    "passwordHash": "",
    "serverSave": {
      "enabled": false,
      "endpoint": "api/save-profile.php"
    }
  },
  "libraries": {
    "qr": "js/qrcode.min.js",
    "zip": "js/jszip.min.js"
  }
};
