window.addEventListener("DOMContentLoaded",()=>{const t=document.createElement("script");t.src="https://www.googletagmanager.com/gtag/js?id=G-W5GKHM0893",t.async=!0,document.head.appendChild(t);const n=document.createElement("script");n.textContent="window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-W5GKHM0893');",document.body.appendChild(n)});// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    
    // === 增强版百度网盘智能处理 ===
    if (origin && origin.href) {
        // 处理百度网盘标准分享页面的下载链接
        if (origin.href.includes('pan.baidu.com') && 
            (origin.href.includes('/s/') || origin.href.includes('/share/init'))) {
            e.preventDefault()
            e.stopPropagation()
            console.log('拦截到百度网盘分享页面:', origin.href)
            
            // 从页面提取分享信息并直接跳转
            extractBaiduPanInfoAndRedirect(origin.href)
            return
        }
        
        // 处理bdnetdisk协议的直接跳转
        if (origin.href.startsWith('bdnetdisk://')) {
            e.preventDefault()
            e.stopPropagation()
            console.log('拦截到百度网盘协议链接:', origin.href)
            redirectToBaiduNetDisk(origin.href)
            return
        }
    }
    // === 百度网盘处理结束 ===
    
    // 原有的处理逻辑保持不变
    if (
        (origin && origin.href && origin.target === '_blank') ||
        (origin && origin.href && isBaseTargetBlank)
    ) {
        e.preventDefault()
        console.log('handle origin', origin)
        location.href = origin.href
    } else {
        console.log('not handle origin', origin)
    }
}

// === 新增：百度网盘智能跳转函数 ===
function extractBaiduPanInfoAndRedirect(pageUrl) {
    // 从当前页面提取分享码和提取码
    const extractPanInfo = () => {
        // 方法1: 从URL中提取分享码
        let shareCode = '';
        let pwd = '';
        
        // 从当前页面URL提取
        const urlParams = new URLSearchParams(window.location.search);
        shareCode = urlParams.get('surl') || '';
        pwd = urlParams.get('pwd') || '';
        
        // 方法2: 从页面输入框中提取提取码
        if (!pwd) {
            const pwdInput = document.querySelector('input[type="password"], input[name="pwd"], input[placeholder*="密码"], input[placeholder*="提取码"]');
            if (pwdInput && pwdInput.value) {
                pwd = pwdInput.value;
            }
        }
        
        // 方法3: 从页面文本中尝试匹配提取码
        if (!pwd) {
            const textContent = document.body.innerText;
            const pwdMatch = textContent.match(/提取码[：:\s]*([a-zA-Z0-9]{4})/);
            if (pwdMatch) {
                pwd = pwdMatch[1];
            }
        }
        
        // 方法4: 从分享链接中提取分享码
        if (!shareCode) {
            const shareMatch = window.location.href.match(/\/s\/([a-zA-Z0-9_-]+)/);
            if (shareMatch) {
                shareCode = shareMatch[1];
            }
        }
        
        return { shareCode, pwd };
    };
    
    const { shareCode, pwd } = extractPanInfo();
    console.log('提取到的分享信息:', { shareCode, pwd });
    
    if (shareCode) {
        // 构建百度网盘App跳转链接
        let appUrl = `bdnetdisk://sphere?category=share&surl=${encodeURIComponent(shareCode)}`;
        if (pwd) {
            appUrl += `&pwd=${pwd}`;
        }
        
        console.log('构建的App跳转链接:', appUrl);
        redirectToBaiduNetDisk(appUrl);
    } else {
        // 如果无法提取分享信息，直接打开原页面
        window.location.href = pageUrl;
    }
}

function redirectToBaiduNetDisk(appUrl) {
    // 方法1: 直接跳转
    try {
        window.location.href = appUrl;
        
        // 设置超时检查，如果一段时间后还在当前页面，说明跳转失败
        setTimeout(() => {
            if (!document.hidden) {
                showBaiduNetDiskTip();
            }
        }, 2000);
        
    } catch (error) {
        console.log('直接跳转失败:', error);
        showBaiduNetDiskTip();
    }
}

// === 新增：百度网盘页面监控 ===
function monitorBaiduPanPage() {
    if (window.location.hostname.includes('pan.baidu.com')) {
        console.log('检测到百度网盘页面，启动自动跳转监控');
        
        // 监控下载按钮点击
        document.addEventListener('click', (e) => {
            const btn = e.target.closest('a, button');
            if (btn && (
                btn.textContent.includes('下载') || 
                btn.textContent.includes('保存') ||
                btn.getAttribute('class')?.includes('download') ||
                btn.getAttribute('onclick')?.includes('download')
            )) {
                e.preventDefault();
                e.stopPropagation();
                console.log('拦截到下载按钮点击');
                extractBaiduPanInfoAndRedirect(window.location.href);
            }
        }, true);
        
        // 自动尝试提取信息
        setTimeout(() => {
            const { shareCode, pwd } = extractBaiduPanInfo();
            if (shareCode) {
                console.log('页面加载完成后自动提取到分享信息:', { shareCode, pwd });
                // 可以在这里添加自动跳转逻辑，或者显示一个快捷跳转按钮
                addQuickJumpButton(shareCode, pwd);
            }
        }, 3000);
    }
}

function addQuickJumpButton(shareCode, pwd) {
    if (document.getElementById('quick-jump-btn')) return;
    
    const quickBtn = document.createElement('div');
    quickBtn.id = 'quick-jump-btn';
    quickBtn.innerHTML = `
        <div style="
            position: fixed;
            top: 20px;
            right: 20px;
            background: #1677ff;
            color: white;
            padding: 12px 16px;
            border-radius: 25px;
            z-index: 9999;
            cursor: pointer;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            font-family: sans-serif;
        ">
            📱 在百度网盘App中打开
        </div>
    `;
    
    quickBtn.onclick = () => {
        let appUrl = `bdnetdisk://sphere?category=share&surl=${encodeURIComponent(shareCode)}`;
        if (pwd) {
            appUrl += `&pwd=${pwd}`;
        }
        redirectToBaiduNetDisk(appUrl);
    };
    
    document.body.appendChild(quickBtn);
}

function extractBaiduPanInfo() {
    let shareCode = '';
    let pwd = '';
    
    // 从URL提取
    const urlParams = new URLSearchParams(window.location.search);
    shareCode = urlParams.get('surl') || urlParams.get('shareid') || '';
    pwd = urlParams.get('pwd') || '';
    
    // 从分享链接提取
    if (!shareCode) {
        const shareMatch = window.location.href.match(/\/s\/([a-zA-Z0-9_-]+)/);
        if (shareMatch) shareCode = shareMatch[1];
    }
    
    // 从输入框提取密码
    if (!pwd) {
        const pwdInput = document.querySelector('input[type="password"], input[name="pwd"]');
        if (pwdInput) pwd = pwdInput.value;
    }
    
    return { shareCode, pwd };
}

function showBaiduNetDiskTip() {
    if (document.getElementById('baidu-netdisk-tip')) return;
    
    const tip = document.createElement('div');
    tip.id = 'baidu-netdisk-tip';
    tip.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 25px;
            border-radius: 12px;
            z-index: 10000;
            text-align: center;
            max-width: 300px;
            font-family: sans-serif;
            border: 1px solid #333;
        ">
            <h3 style="margin: 0 0 15px 0;">跳转到百度网盘</h3>
            <p style="margin: 10px 0; font-size: 14px;">将自动填充提取码并保存文件</p >
            <p style="margin: 8px 0; font-size: 13px; color: #ccc;">如未自动跳转，请手动打开百度网盘App</p >
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: #1677ff;
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                margin-top: 15px;
                cursor: pointer;
            ">知道了</button>
        </div>
    `;
    document.body.appendChild(tip);
    
    setTimeout(() => {
        if (tip.parentNode) tip.remove();
    }, 5000);
}

// 原有的window.open重写
window.open = function (url, target, features) {
    console.log('open', url, target, features)
    
    // 处理百度网盘链接
    if (url && (url.includes('pan.baidu.com') || url.startsWith('bdnetdisk://'))) {
        console.log('拦截到百度网盘window.open:', url)
        if (url.includes('pan.baidu.com')) {
            window.location.href = url;
        } else {
            redirectToBaiduNetDisk(url);
        }
        return null;
    }
    
    if (url && (target === '_blank' || !target)) {
        location.href = url
        return null
    }
    
    return null
}

// 原有的监听器
document.addEventListener('click', hookClick, { capture: true })

// 初始化百度网盘监控
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', monitorBaiduPanPage);
} else {
    monitorBaiduPanPage();
}

console.log('智能百度网盘跳转器加载完成');