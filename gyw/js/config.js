// 配置文件
const CONFIG = {
    // 背景图片配置
    BACKGROUND_IMAGES: {
        P_BACKGROUND: 'images/default-p-bg.jpg',
        S_BACKGROUND: 'images/default-s-bg.jpg'
    },
    
    // 默认设置 - 改成小写
    DEFAULT_SETTINGS: {
        P: {
            qrWidth: 40,
            qrX: 30,
            qrY: 35,
            qrOpacity: 100,
            qrRotation: 0
        },
        S: {
            qrWidth: 50,
            qrX: 25,
            qrY: 50,
            qrOpacity: 100,
            qrRotation: 0
        }
    },
    
    // 二维码识别配置
    QR_CONFIG: {
        MARGIN: 10,
        MIN_SIZE: 50
    },
    
    // 文件上传配置
    UPLOAD_CONFIG: {
        MAX_FILE_SIZE: 5 * 1024 * 1024,
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
    },

    // 二维码生成API配置
    QR_API: {
        BASE_URL: 'https://api.qrtool.cn/',
        DEFAULT_SIZE: 500,
        DEFAULT_MARGIN: 10,
        DEFAULT_LEVEL: 'H'
    }
};
