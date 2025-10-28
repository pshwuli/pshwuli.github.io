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
            this.showUploadingState(uploadArea);

            callback(file).finally(() => {
                this.uploadProcessing.set(processingKey, false);
                this.hideUploadingState(uploadArea);
                fileInput.value = '';
            });
        };

        // 修复：只在非按钮区域触发文件选择
        uploadArea.addEventListener('click', (e) => {
            // 只有当点击的是上传区域本身（不是按钮或按钮的子元素）时才触发
            if (e.target === uploadArea || 
                (e.target.classList.contains('upload-icon') || 
                 e.target.classList.contains('upload-text') ||
                 e.target.classList.contains('upload-hint'))) {
                fileInput.click();
            }
        });

        // 按钮点击 - 确保不会冒泡到区域
        if (uploadBtn) {
            uploadBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                fileInput.click();
            });
        }

        // 拖拽事件
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('active');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('active');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('active');
            if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
        });

        // 文件选择
        fileInput.addEventListener('change', (e) => {
            if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
        });
    }

    // 上传状态管理
    showUploadingState(uploadArea) {
        uploadArea.classList.add('uploading');
        const uploadBtn = uploadArea.querySelector('.upload-btn');
        if (uploadBtn) {
            uploadBtn.disabled = true;
            uploadBtn.textContent = '上传中...';
        }
    }

    hideUploadingState(uploadArea) {
        uploadArea.classList.remove('uploading');
        const uploadBtn = uploadArea.querySelector('.upload-btn');
        if (uploadBtn) {
            uploadBtn.disabled = false;
            uploadBtn.textContent = '选择文件';
        }
    }

    async handleQRUpload(file) {
        try {
            const img = await this.loadImage(file);
            const preview = document.getElementById('originalPreview');
            if (preview) {
                preview.innerHTML = '';
                preview.appendChild(img.cloneNode());
            }
            
            this.currentQRCode = img;
            const decodeResult = await this.decodeQRCode(img);
            this.currentQRText = decodeResult.data;
            
            this.updateQRInfoDisplay(decodeResult);
            this.saveToLocalStorage();
            this.showSuccess('二维码上传成功');
            
        } catch (error) {
            this.showError('二维码上传失败: ' + error.message);
            throw error;
        }
    }

    async handlePBackgroundUpload(file) {
        try {
            await this.saveBackgroundToLocalStorage(file, 'p');
            this.pBackground = await this.loadBackgroundImage(file, 'pBackgroundPreview');
            this.showSuccess('P背景上传成功');
            // 只在最后调用一次 saveToLocalStorage
            this.saveToLocalStorage();
        } catch (error) {
            this.showError('P背景上传失败: ' + error.message);
            throw error;
        }
    }

    async handleSBackgroundUpload(file) {
        try {
            await this.saveBackgroundToLocalStorage(file, 's');
            this.sBackground = await this.loadBackgroundImage(file, 'sBackgroundPreview');
            this.showSuccess('S背景上传成功');
            // 只在最后调用一次 saveToLocalStorage
            this.saveToLocalStorage();
        } catch (error) {
            this.showError('S背景上传失败: ' + error.message);
            throw error;
        }
    }

    // 保存背景图片到本地存储
    async saveBackgroundToLocalStorage(file, type) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const backgroundData = {
                        dataUrl: e.target.result,
                        type: type,
                        timestamp: new Date().getTime(),
                        fileName: file.name,
                        fileSize: file.size,
                        fileType: file.type
                    };
                    localStorage.setItem(`qrFusionBackground_${type}`, JSON.stringify(backgroundData));
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsDataURL(file);
        });
    }

    async loadBackgroundImage(file, previewId) {
        const img = await this.loadImage(file);
        const preview = document.getElementById(previewId);
        if (preview) {
            preview.innerHTML = '';
            preview.appendChild(img.cloneNode());
        }
        return img;
    }

    // 修复：正确处理 Promise 的 loadDefaultBackgrounds
    async loadDefaultBackgrounds() {
        try {
            const [pBg, sBg] = await Promise.all([
                this.loadBackgroundFromLocalStorage('p'),
                this.loadBackgroundFromLocalStorage('s')
            ]);
            
            // 使用 await 确保获取的是 Image 对象而不是 Promise
            this.pBackground = pBg || await this.loadDefaultBackground(CONFIG.BACKGROUND_IMAGES.P_BACKGROUND, 'pBackgroundPreview');
            this.sBackground = sBg || await this.loadDefaultBackground(CONFIG.BACKGROUND_IMAGES.S_BACKGROUND, 'sBackgroundPreview');
        } catch (error) {
            console.warn('加载默认背景失败:', error);
        }
    }

    async loadBackgroundFromLocalStorage(type) {
        return new Promise((resolve) => {
            try {
                const savedData = localStorage.getItem(`qrFusionBackground_${type}`);
                if (savedData) {
                    const backgroundData = JSON.parse(savedData);
                    const img = new Image();
                    img.onload = () => {
                        const preview = document.getElementById(`${type}BackgroundPreview`);
                        if (preview) {
                            preview.innerHTML = '';
                            preview.appendChild(img.cloneNode());
                        }
                        resolve(img);
                    };
                    img.onerror = () => resolve(null);
                    img.src = backgroundData.dataUrl;
                } else {
                    resolve(null);
                }
            } catch (error) {
                resolve(null);
            }
        });
    }

    async loadDefaultBackground(src, previewId) {
        return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const preview = document.getElementById(previewId);
                if (preview) {
                    preview.innerHTML = '';
                    preview.appendChild(img.cloneNode());
                }
                resolve(img);
            };
            img.onerror = () => resolve(null);
            img.src = src;
        });
    }

    validateFile(file) {
        if (!file) {
            this.showError('请选择文件');
            return false;
        }
        if (!CONFIG.UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type)) {
            this.showError('请上传 PNG、JPG 或 WebP 格式的图片');
            return false;
        }
        if (file.size > CONFIG.UPLOAD_CONFIG.MAX_FILE_SIZE) {
            this.showError('文件大小超过限制（5MB）');
            return false;
        }
        return true;
    }

    loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('图片加载失败'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsDataURL(file);
        });
    }

    // 二维码生成API函数
    async generateQRCodeAPI(text) {
        const { BASE_URL, DEFAULT_SIZE, DEFAULT_MARGIN, DEFAULT_LEVEL } = CONFIG.QR_API;
        const url = `${BASE_URL}?text=${encodeURIComponent(text)}&size=${DEFAULT_SIZE}&margin=${DEFAULT_MARGIN}&level=${DEFAULT_LEVEL}`;
        
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('API请求失败');
            
            const blob = await response.blob();
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error('二维码加载失败'));
                img.src = URL.createObjectURL(blob);
            });
        } catch (error) {
            throw new Error('二维码生成失败: ' + error.message);
        }
    }

    decodeQRCode(img) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, canvas.height);

            resolve({
                success: !!code,
                data: code?.data || null,
                location: code?.location || null
            });
        });
    }

    // 提前插入进度条CSS
    insertProgressStyles() {
        if (!document.querySelector('#progressStyles')) {
            const style = document.createElement('style');
            style.id = 'progressStyles';
            style.textContent = `
                .progress-container {
                    background: rgba(255, 255, 255, 0.95);
                    padding: 20px;
                    border-radius: 12px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    text-align: center;
                    margin: 10px 0;
                }
                .progress-header {
                    font-weight: 600;
                    margin-bottom: 15px;
                    color: #333;
                }
                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: #e5e7eb;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 10px;
                }
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #10b981, #34d399);
                    border-radius: 4px;
                    width: 0%;
                    transition: width 0.3s ease;
                }
                .progress-text {
                    font-size: 14px;
                    color: #6b7280;
                    font-weight: 500;
                }
                .uploading {
                    opacity: 0.7;
                    pointer-events: none;
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 创建进度条
    createProgressBar() {
        return `
            <div class="progress-container">
                <div class="progress-header">
                    <span>🔄 正在生成二维码...</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="progress-text" id="progressText">0%</div>
            </div>
        `;
    }

    // 更新进度条
    updateProgress(percentage, text) {
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');
        if (progressFill) progressFill.style.width = percentage + '%';
        if (progressText) progressText.textContent = text || percentage + '%';
    }

    updateQRInfoDisplay(decodeResult) {
        const qrDataElement = document.getElementById('qrData');
        if (decodeResult.success) {
            qrDataElement.innerHTML = `
                <div class="success-state" style="padding: var(--space-3); border-radius: var(--radius);">
                    <div style="font-weight: 600; color: var(--secondary); margin-bottom: var(--space-2);">
                        ✅ 二维码识别成功
                    </div>
                    <div style="font-size: var(--font-size-sm); word-break: break-all;">
                        ${decodeResult.data}
                    </div>
                    <div style="font-size: var(--font-size-xs); color: var(--text-tertiary); margin-top: var(--space-2);">
                        📍 将使用API生成清晰的二维码进行合并
                    </div>
                </div>
            `;
        } else {
            qrDataElement.innerHTML = `
                <div style="padding: var(--space-3); border-radius: var(--radius); background: rgba(239, 68, 68, 0.1);">
                    <div style="font-weight: 600; color: var(--danger); margin-bottom: var(--space-2);">
                        ⚠️ 未识别到二维码
                    </div>
                    <div style="font-size: var(--font-size-sm); color: var(--text-secondary);">
                        无法生成合并图片，请上传有效的二维码图片
                    </div>
                </div>
            `;
        }
    }

    // 初始化设置
    initSettings() {
        this.loadFromLocalStorage();
        const savedData = localStorage.getItem('qrFusionData');
        if (!savedData) {
            this.applySettings('p', CONFIG.DEFAULT_SETTINGS.P);
            this.applySettings('s', CONFIG.DEFAULT_SETTINGS.S);
        }
        this.updateSliderValues();
    }

    // 设置滑块
    setupSettingSliders() {
        const setupSlider = (sliderId) => {
            const slider = document.getElementById(sliderId);
            if (slider) {
                slider.addEventListener('input', () => {
                    this.updateSliderValues();
                    this.saveToLocalStorage();
                });
            }
        };

        ['pQrWidth', 'pQrX', 'pQrY', 'pQrOpacity', 'pQrRotation',
         'sQrWidth', 'sQrX', 'sQrY', 'sQrOpacity', 'sQrRotation'].forEach(setupSlider);

        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
                this.saveToLocalStorage();
            });
        });
    }

    // 切换选项卡
    switchTab(tabName) {
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
        const targetContent = document.getElementById(tabName);
        if (targetButton && targetContent) {
            targetButton.classList.add('active');
            targetContent.classList.add('active');
        }
    }

    // 更新滑块值显示
    updateSliderValues() {
        const sliders = {
            pQrWidth: 'pQrWidthValue', pQrX: 'pQrXValue', pQrY: 'pQrYValue', pQrOpacity: 'pQrOpacityValue', pQrRotation: 'pQrRotationValue',
            sQrWidth: 'sQrWidthValue', sQrX: 'sQrXValue', sQrY: 'sQrYValue', sQrOpacity: 'sQrOpacityValue', sQrRotation: 'sQrRotationValue'
        };

        Object.entries(sliders).forEach(([sliderId, valueId]) => {
            const slider = document.getElementById(sliderId);
            const valueElement = document.getElementById(valueId);
            if (slider && valueElement) {
                valueElement.textContent = slider.value + (sliderId.includes('Rotation') ? '°' : '%');
            }
        });
    }

    // 切换设置面板显示
    toggleSettings(forceState = null) {
        const content = document.getElementById('settingsContent');
        const toggle = document.getElementById('settingsToggle');
        if (!content || !toggle) return;
        
        const shouldShow = forceState !== null ? forceState : content.style.display !== 'block';
        content.style.display = shouldShow ? 'block' : 'none';
        toggle.classList.toggle('active', shouldShow);
        this.saveToLocalStorage();
    }

    async handleMerge(type) {
        if (!this.currentQRCode) {
            this.showError('请先上传二维码图片');
            return;
        }
        if (!this.currentQRText) {
            this.showError('未识别到二维码内容');
            return;
        }

        const background = type === 'p' ? this.pBackground : this.sBackground;
        if (!background) {
            this.showError(`请先上传${type.toUpperCase()}背景图片`);
            return;
        }

        try {
            const resultPreview = document.getElementById('resultPreview');
            resultPreview.innerHTML = this.createProgressBar();
            
            this.updateProgress(10, '开始处理...');
            const apiQRCode = await this.generateQRCodeAPI(this.currentQRText);
            this.updateProgress(60, '二维码生成完成');
            
            this.updateProgress(80, '正在合并图片...');
            const mergedImage = await this.mergeImages(background, apiQRCode, type);
            this.updateProgress(100, '合并完成！');
            
            URL.revokeObjectURL(apiQRCode.src);
            
            setTimeout(() => {
                resultPreview.innerHTML = '';
                resultPreview.appendChild(mergedImage);
                this.currentMergedImage = mergedImage;
                document.getElementById('downloadBtn').disabled = false;
            }, 500);
            
        } catch (error) {
            this.showError('图片处理失败: ' + error.message);
            const resultPreview = document.getElementById('resultPreview');
            resultPreview.innerHTML = '<div class="preview-placeholder">处理失败，请重试</div>';
        }
    }

    // 修改合并图片函数，支持分别设置
    mergeImages(background, qrCode, type) {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            canvas.width = background.width;
            canvas.height = background.height;
            ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
            
            const widthPercent = parseInt(document.getElementById(`${type}QrWidth`).value);
            const xPercent = parseInt(document.getElementById(`${type}QrX`).value);
            const yPercent = parseInt(document.getElementById(`${type}QrY`).value);
            const opacity = parseInt(document.getElementById(`${type}QrOpacity`).value) / 100;
            const rotation = parseInt(document.getElementById(`${type}QrRotation`).value) * Math.PI / 180;
            
            const qrSize = (canvas.width * widthPercent) / 100;
            const x = (canvas.width * xPercent) / 100;
            const y = (canvas.height * yPercent) / 100;
            
            ctx.save();
            ctx.translate(x + qrSize / 2, y + qrSize / 2);
            ctx.rotate(rotation);
            ctx.globalAlpha = opacity;
            ctx.drawImage(qrCode, -qrSize / 2, -qrSize / 2, qrSize, qrSize);
            ctx.restore();
            
            const mergedImage = new Image();
            mergedImage.onload = () => resolve(mergedImage);
            mergedImage.src = canvas.toDataURL('image/png');
        });
    }

    handleDownload() {
        if (!this.currentMergedImage) {
            this.showError('没有可下载的图片');
            return;
        }
        const link = document.createElement('a');
        link.download = `qr-fusion-${new Date().getTime()}.png`;
        link.href = this.currentMergedImage.src;
        link.click();
    }

    handleReset() {
        if (confirm('确定要重置所有内容吗？这将清除所有设置和上传的图片！')) {
            ['qrFileInput', 'pBgFileInput', 'sBgFileInput'].forEach(id => {
                const element = document.getElementById(id);
                if (element) element.value = '';
            });
            
            ['originalPreview', 'pBackgroundPreview', 'sBackgroundPreview', 'resultPreview'].forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    element.innerHTML = `<div class="preview-placeholder">
                        <span>${id === 'originalPreview' ? '🖼️' : id.includes('Background') ? '🎨' : '✨'}</span>
                        <p>${id === 'originalPreview' ? '等待上传二维码' : id.includes('Background') ? '背景图片' : '选择合并方式生成结果'}</p>
                    </div>`;
                }
            });
            
            document.getElementById('qrData').innerHTML = `
                <div class="info-placeholder">
                    <span>📋</span>
                    <p>等待上传二维码图片...</p>
                </div>
            `;
            
            this.applySettings('p', CONFIG.DEFAULT_SETTINGS.P);
            this.applySettings('s', CONFIG.DEFAULT_SETTINGS.S);
            this.updateSliderValues();
            document.getElementById('downloadBtn').disabled = true;
            
            localStorage.removeItem('qrFusionData');
            localStorage.removeItem('qrFusionBackground_p');
            localStorage.removeItem('qrFusionBackground_s');
            
            this.currentQRCode = null;
            this.currentQRText = null;
            this.currentMergedImage = null;
            this.pBackground = null;
            this.sBackground = null;
            
            this.loadDefaultBackgrounds();
            this.toggleSettings(false);
            this.showSuccess('已重置所有内容');
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <span>${type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️'}</span>
            <span>${message}</span>
        `;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : '#3b82f6',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: '1000',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500'
        });
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new QRFusionApp();
});