(function() {
    let backToTopButton = null;
    let scrollHandler = null;
    
    function toggleBackToTopButton() {
        if (!backToTopButton) return;
        if (window.scrollY > window.innerHeight) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    }
    
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    function initBackToTop() {
        backToTopButton = document.getElementById('back-to-top');
        if (!backToTopButton) return;
        scrollHandler = toggleBackToTopButton;
        window.addEventListener('scroll', scrollHandler);
        backToTopButton.addEventListener('click', scrollToTop);
        toggleBackToTopButton();
    }
    
    function cleanupBackToTop() {
        if (scrollHandler) {
            window.removeEventListener('scroll', scrollHandler);
        }
    }
    
    if (typeof window.RODINA === 'undefined') window.RODINA = {};
    window.RODINA.backToTop = {
        init: initBackToTop,
        cleanup: cleanupBackToTop
    };
    
    if (document.readyState !== 'loading') {
        initBackToTop();
    } else {
        document.addEventListener('DOMContentLoaded', initBackToTop);
    }
})();