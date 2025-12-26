// Web JS
function loadPage(pageName) {
    // In a real SPA, this would fetch content or use a router.
    // For this prototype, we'll just redirect to different HTML files.
    window.location.href = pageName;
}

function showWebToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: #fff; padding: 12px 24px; border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); font-size: 14px;
        display: flex; align-items: center; gap: 8px; z-index: 9999;
        animation: slideDown 0.3s ease;
    `;
    toast.innerHTML = `<i class="fas fa-check-circle" style="color: #52c41a"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}
