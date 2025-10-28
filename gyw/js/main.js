// 主功能文件
class QRFusionApp {
    constructor() {
        this.currentQRCode = null;
        this.currentQRText = null;
        this.currentMergedImage = null;
        this.pBackground = null;
        this.sBackground = null;
        this.uploadProcessing = new Map(); // 实例级别的上传状态管理
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDefaultBackgrounds();
        setTimeout(() => {
            this.initSettings();
        }, 100);
    }

    // 保存数据到本地存储
    saveToLocalStorage() {
        const data = {
            settings: {
                p: {
                    qrWidth: document.getElementById('pQrWidth')?.value || CONFIG.DEFAULT_SETTINGS.P.QR_WIDTH,
                    qrX: document.getElementById('pQrX')?.value || CONFIG.DEFAULT_SETTINGS.P.QR_X,
                    qrY: document.getElementById('pQrY')?.value || CONFIG.DEFAULT_SETTINGS.P.QR_Y,
                    qrOpacity: document.getElementById('pQrOpacity')?.value || CONFIG.DEFAULT_SETTINGS.P.QR_OPACITY,
                    qrRotation: document.getElementById('pQrRotation')?.value || CONFIG.DEFAULT_SETTINGS.P.QR_ROTATION
                },
                s: {
                    qrWidth: document.getElementById('sQrWidth')?.value || CONFIG.DEFAULT_SETTINGS.S.QR_WIDTH,
                    qrX: document.getElementById('sQrX')?.value || CONFIG.DEFAULT_SETTINGS.S.QR_X,
                    qrY: document.getElementById('sQrY')?.value || CONFIG.DEFAULT_SETTINGS.S.QR_Y,
                    qrOpacity: document.getElementById('sQrOpacity')?.value || CONFIG.DEFAULT_SETTINGS.S.QR_OPACITY,
                    qrRotation: document.getElementById('sQrRotation')?.value || CONFIG.DEFAULT_SETTINGS.S.QR_ROTATION
                }
            },
            settingsExpanded: document.getElementById('settingsContent').style.display === 'block',
            activeTab: document.querySelector('.tab-button.active')?.dataset.tab || 'p-settings',
            qrText: this.currentQRText,
        };
        
        try {
            localStorage.setItem('qrFusionData', JSON.stringify(data));
        } catch (error) {
            console.warn('保存数据失败:', error);
        }
    }

    // 从本地存储加载数据
    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('qrFusionData');
            if (savedData) {
                const data = JSON.parse(savedData);
                
                if (data.settings) {
                    if (data.settings.p) this.applySettings('p', data.settings.p);
                    if (data.settings.s) this.applySettings('s', data.settings.s);
                }
                
                if (data.settingsExpanded) {
                    setTimeout(() => this.toggleSettings(true), 200);
                }
                
                if (data.activeTab) {
                    setTimeout(() => this.switchTab(data.activeTab), 200);
                }
                
                if (data.qrText) {
                    this.currentQRText = data.qrText;
                }
            }
        } catch (error) {
            console.warn('加载数据失败:', error);
        }
    }

    // 应用设置到界面
    applySettings(type, settings) {
        Object.keys(settings).forEach(key => {
            const element = document.getElementById(`${type}${key.charAt(0).toUpperCase() + key.slice(1)}`);
            if (element) element.value = settings[key];
        });
    }

    setupEventListeners() {
        this.setupFileUpload('qrFileInput', 'qrUploadArea', this.handleQRUpload.bind(this));
        this.setupFileUpload('pBgFileInput', 'pBgUploadArea', this.handlePBackgroundUpload.bind(this));
        this.setupFileUpload('sBgFileInput', 'sBgUploadArea', this.handleSBackgroundUpload.bind(this));

        document.getElementById('pMergeBtn').addEventListener('click', () => this.handleMerge('p'));
        document.getElementById('sMergeBtn').addEventListener('click', () => this.handleMerge('s'));
        document.getElementById('downloadBtn').addEventListener('click', () => this.handleDownload());
        document.getElementById('resetBtn').addEventListener('click', () => this.handleReset());
        document.getElementById('settingsToggle').addEventListener('click', () => this.toggleSettings());

        this.setupSettingSliders();

        // 提前插入进度条CSS，避免重复检查
        this.insertProgressStyles();
    }

    // 修复的文件上传绑定 - 彻底解决重复触发问题
    setupFileUpload(inputId, areaId, callback) {
        const fileInput = document.getElementById(inputId);
        const uploadArea = document.getElementById(areaId);
        const uploadBtn = uploadArea.querySelector('.upload-btn');

        // 使用实例级别的处理状态，避免并发问题
        const processingKey = `${inputId}_processing`;

        const handleFileSelect = (file) => {
            if (this.uploadProcessing.get(processingKey) || !file || !this.validateFile(file)) {
                return;
            }

            this.uploadProcessing.set(processingKey, true);
            this
