(function() {
    let slidesContainer = null;
    let prevBtn = null;
    let nextBtn = null;
    let indicators = [];
    let counter = null;
    let totalSlides = 0;
    let currentSlide = 0;
    let autoplayInterval = null;
    let gallery = null;
    
    function updateSlide() {
        slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        indicators.forEach((indicator, index) => {
            if (index === currentSlide) {
                indicator.classList.add('active');
            } else {
                indicator.classList.remove('active');
            }
        });
        
        if (counter) {
            counter.textContent = `${currentSlide + 1} / ${totalSlides}`;
        }
    }
    
    function prevSlide() {
        currentSlide = (currentSlide > 0) ? currentSlide - 1 : totalSlides - 1;
        updateSlide();
    }
    
    function nextSlide() {
        currentSlide = (currentSlide < totalSlides - 1) ? currentSlide + 1 : 0;
        updateSlide();
    }
    
    function startAutoplay() {
        if (autoplayInterval) clearInterval(autoplayInterval);
        
        autoplayInterval = setInterval(() => {
            nextSlide();
        }, 5000);
    }
    
    function stopAutoplay() {
        if (autoplayInterval) {
            clearInterval(autoplayInterval);
            autoplayInterval = null;
        }
    }
    
    function handleMouseEnter() {
        stopAutoplay();
    }
    
    function handleMouseLeave() {
        startAutoplay();
    }
    
    function initSliders() {
        slidesContainer = document.getElementById('screenshotsSlides');
        prevBtn = document.getElementById('screenshotPrevBtn');
        nextBtn = document.getElementById('screenshotNextBtn');
        indicators = document.querySelectorAll('.screenshot-indicator');
        counter = document.getElementById('screenshotCounter');
        gallery = document.querySelector('.screenshots-gallery');
        
        if (!slidesContainer) return;
        
        totalSlides = document.querySelectorAll('.screenshot-slide').length;
        currentSlide = 0;
        
        if (prevBtn) {
            prevBtn.addEventListener('click', prevSlide);
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', nextSlide);
        }
        
        indicators.forEach((indicator, index) => {
            indicator.addEventListener('click', () => {
                currentSlide = index;
                updateSlide();
            });
        });
        
        if (gallery) {
            gallery.addEventListener('mouseenter', handleMouseEnter);
            gallery.addEventListener('mouseleave', handleMouseLeave);
        }
        
        updateSlide();
        startAutoplay();
    }
    
    function cleanupSliders() {
        stopAutoplay();
        
        if (prevBtn) {
            prevBtn.removeEventListener('click', prevSlide);
        }
        
        if (nextBtn) {
            nextBtn.removeEventListener('click', nextSlide);
        }
        
        indicators.forEach(indicator => {
            indicator.removeEventListener('click', () => {});
        });
        
        if (gallery) {
            gallery.removeEventListener('mouseenter', handleMouseEnter);
            gallery.removeEventListener('mouseleave', handleMouseLeave);
        }
    }
    
    if (typeof window.RODINA === 'undefined') window.RODINA = {};
    window.RODINA.sliders = {
        init: initSliders,
        cleanup: cleanupSliders,
        prevSlide: prevSlide,
        nextSlide: nextSlide,
        stopAutoplay: stopAutoplay,
        startAutoplay: startAutoplay
    };
    
    if (document.readyState !== 'loading') {
        initSliders();
    } else {
        document.addEventListener('DOMContentLoaded', initSliders);
    }
})();