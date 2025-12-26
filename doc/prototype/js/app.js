// Common JS functions
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast show';
    toast.innerText = message;
    document.querySelector('.device').appendChild(toast);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function navigateTo(url) {
    window.location.href = url;
}

function toggleModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.toggle('show');
    }
}

// Simple Back Button Logic
document.addEventListener('DOMContentLoaded', () => {
    const backBtns = document.querySelectorAll('.back-btn');
    backBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            window.history.back();
        });
    });
});
