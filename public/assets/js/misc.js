(function() {
    let lazyImages = [];
    let lazyImageLoadHandler = null;
    
    function handleImageLoad(img) {
        img.classList.add('loaded');
    }
    
    function initLazyImages() {
        lazyImages = document.querySelectorAll('img[loading="lazy"]');
        if (!lazyImages.length) return;
        
        lazyImageLoadHandler = function(img) {
            return function() {
                handleImageLoad(img);
            };
        };
        
        lazyImages.forEach(img => {
            if (img.complete) {
                handleImageLoad(img);
            } else {
                const handler = lazyImageLoadHandler(img);
                img.addEventListener('load', handler);
                img.addEventListener('error', handler);
            }
        });
    }
    
    function initSlides() {
        const slides = document.getElementById('screenshotsSlides');
        const prevBtn = document.getElementById('screenshotPrevBtn');
        const nextBtn = document.getElementById('screenshotNextBtn');
        const indicators = document.querySelectorAll('.screenshot-indicator');
        const counter = document.getElementById('screenshotCounter');
        
        if (!slides) return;
        
        let currentSlide = 0;
        const totalSlides = document.querySelectorAll('.screenshot-slide').length;
        
        function updateSlider() {
            slides.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentSlide);
            });
            
            if (counter) {
                counter.textContent = `${currentSlide + 1} / ${totalSlides}`;
            }
        }
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                updateSlider();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                currentSlide = (currentSlide + 1) % totalSlides;
                updateSlider();
            });
        }
        
        indicators.forEach(indicator => {
            indicator.addEventListener('click', () => {
                const index = parseInt(indicator.getAttribute('data-index'));
                if (!isNaN(index)) {
                    currentSlide = index;
                    updateSlider();
                }
            });
        });
    }
    
    function initMisc() {
        initLazyImages();
        initSlides();
        
        if (window.RODINA && window.RODINA.backToTop && window.RODINA.backToTop.init) {
            window.RODINA.backToTop.init();
        } else {
            const backToTopButton = document.getElementById('back-to-top');
            if (backToTopButton) {
                function toggleBackToTopButton() {
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
                
                window.addEventListener('scroll', toggleBackToTopButton);
                backToTopButton.addEventListener('click', scrollToTop);
                toggleBackToTopButton();
            }
        }
    }
    
    if (typeof window.RODINA === 'undefined') window.RODINA = {};
    window.RODINA.misc = {
        init: initMisc
    };
    
    if (document.readyState !== 'loading') {
        initMisc();
    } else {
        document.addEventListener('DOMContentLoaded', initMisc);
    }
})();