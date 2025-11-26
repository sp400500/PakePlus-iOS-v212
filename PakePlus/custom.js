// very important, if you don't know what it is, don't touch it
// 非常重要，不懂代码不要动，这里可以解决80%的问题，也可以生产1000+的bug
const hookClick = (e) => {
    const origin = e.target.closest('a')
    const isBaseTargetBlank = document.querySelector(
        'head base[target="_blank"]'
    )
    console.log('origin', origin, isBaseTargetBlank)
    
    // === 新增：百度网盘处理 - 放在最前面 ===
    if (origin && origin.href && origin.href.startsWith('bdnetdisk://')) {
        e.preventDefault()
        e.stopPropagation()
        console.log('拦截到百度网盘链接:', origin.href)
        
        // Android方法：直接尝试跳转
        try {
            window.location.href = origin.href
        } catch (error) {
            console.log('直接跳转失败:', error)
            // 备用方案：iframe
            try {
                const iframe = document.createElement('iframe')
                iframe.style.display = 'none'
                iframe.src = origin.href
                document.body.appendChild(iframe)
                setTimeout(() => {
                    if (iframe.parentNode) {
                        document.body.removeChild(iframe)
                    }
                }, 1000)
            } catch (iframeError) {
                console.log('iframe方法也失败:', iframeError)
            }
        }
        return
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

// 原有的window.open重写，增加百度网盘支持
window.open = function (url, target, features) {
    console.log('open', url, target, features)
    
    // === 新增：百度网盘处理 ===
    if (url && url.startsWith('bdnetdisk://')) {
        console.log('拦截百度网盘window.open:', url)
        try {
            window.location.href = url
        } catch (error) {
            console.log('百度网盘跳转失败:', error)
        }
        return null
    }
    // === 百度网盘处理结束 ===
    
    // 原有的其他逻辑保持不变
    if (url && (target === '_blank' || !target)) {
        location.href = url
        return null
    }
    
    return null
}

// === 新增：百度网盘提示功能 ===
function initBaiduNetDiskTips() {
    // 监听百度网盘链接点击
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a')
        if (link && link.href && link.href.startsWith('bdnetdisk://')) {
            setTimeout(() => {
                showBaiduNetDiskTip()
            }, 1500)
        }
    }, true)
}

function showBaiduNetDiskTip() {
    if (document.getElementById('baidu-netdisk-tip')) return
    
    const tip = document.createElement('div')
    tip.id = 'baidu-netdisk-tip'
    tip.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.85);
            color: white;
            padding: 20px;
            border-radius: 10px;
            z-index: 10000;
            text-align: center;
            max-width: 280px;
            font-family: sans-serif;
        ">
            <h3 style="margin: 0 0 10px 0;">正在打开百度网盘</h3>
            <p style="margin: 5px 0; font-size: 14px;">如果未自动打开，请：</p >
            <p style="margin: 5px 0; font-size: 13px;">1. 确保已安装百度网盘App</p >
            <p style="margin: 5px 0; font-size: 13px;">2. 返回刷新页面</p >
            <button onclick="this.parentElement.parentElement.remove()" style="
                background: #1677ff;
                color: white;
                border: none;
                padding: 8px 16px;
                border-radius: 5px;
                margin-top: 10px;
                cursor: pointer;
            ">知道了</button>
        </div>
    `
    document.body.appendChild(tip)
    
    setTimeout(() => {
        if (document.getElementById('baidu-netdisk-tip')) {
            document.getElementById('baidu-netdisk-tip').remove()
        }
    }, 5000)
}

// 原有的监听器保持不变
document.addEventListener('click', hookClick, { capture: true })

// 初始化百度网盘提示
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBaiduNetDiskTips)
} else {
    initBaiduNetDiskTips()
}

console.log('增强版链接处理器加载完成 - 包含百度网盘支持')