(function() {
    let mobileMenuButton = null;
    let mobileMenu = null;
    let mobileMenuIcon = null;
    let desktopToggleButtons = [];
    let submenuToggles = [];
    let resizeHandler = null;
    let documentClickHandler = null;
    
    function initDesktopMenus() {
        if (window.innerWidth >= 1024) {
            document.querySelectorAll('.group').forEach(group => {
                const submenu = group.querySelector('div[class*="absolute"]');
                if (!submenu) return;
                
                group.addEventListener('mouseenter', function() {
                    submenu.classList.remove('opacity-0', 'invisible');
                    submenu.classList.add('opacity-100', 'visible');
                });
                
                group.addEventListener('mouseleave', function() {
                    submenu.classList.remove('opacity-100', 'visible');
                    submenu.classList.add('opacity-0', 'invisible');
                });
            });
        }
    }
    
    function handleDesktopToggleClick(e) {
        e.stopPropagation();
        e.preventDefault();
        
        const button = e.currentTarget;
        const group = button.closest('.group');
        const submenu = group.querySelector('div[class*="absolute"]');
        
        document.querySelectorAll('.hidden.md\\:flex .group div[class*="absolute"]').forEach(menu => {
            if (menu !== submenu) {
                menu.classList.remove('opacity-100', 'visible');
                menu.classList.add('opacity-0', 'invisible');
            }
        });
        
        if (submenu.classList.contains('opacity-0') || submenu.classList.contains('invisible')) {
            submenu.classList.remove('opacity-0', 'invisible');
            submenu.classList.add('opacity-100', 'visible');
        } else {
            submenu.classList.remove('opacity-100', 'visible');
            submenu.classList.add('opacity-0', 'invisible');
        }
    }
    
    function handleDocumentClick(e) {
        if (!e.target.closest('.desktop-submenu-toggle') && !e.target.closest('.group div[class*="absolute"]')) {
            document.querySelectorAll('.hidden.md\\:flex .group div[class*="absolute"]').forEach(menu => {
                menu.classList.remove('opacity-100', 'visible');
                menu.classList.add('opacity-0', 'invisible');
            });
        }
        
        if (mobileMenu && mobileMenuButton && !mobileMenu.contains(e.target) && !mobileMenuButton.contains(e.target)) {
            closeMobileMenu();
        }
    }
    
    function toggleMobileMenu(e) {
        if (e) e.stopPropagation();
        
        mobileMenu.classList.toggle('hidden');
        mobileMenuIcon.classList.toggle('bi-list');
        mobileMenuIcon.classList.toggle('bi-x');
        
        if (!mobileMenu.classList.contains('hidden')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
    
    function closeMobileMenu() {
        if (!mobileMenu.classList.contains('hidden')) {
            mobileMenu.classList.add('hidden');
            mobileMenuIcon.classList.remove('bi-x');
            mobileMenuIcon.classList.add('bi-list');
            document.body.style.overflow = '';
            
            document.querySelectorAll('.mobile-submenu-content').forEach(content => {
                content.classList.add('hidden');
                content.style.maxHeight = '0';
            });
            
            document.querySelectorAll('.mobile-submenu-toggle').forEach(toggleBtn => {
                toggleBtn.classList.remove('active');
            });
        }
    }
    
    function handleMobileLinkClick() {
        closeMobileMenu();
    }
    
    function handleSubmenuToggleClick(e) {
        e.stopPropagation();
        const toggle = e.currentTarget;
        const submenuContent = toggle.nextElementSibling;
        const isHidden = submenuContent.classList.contains('hidden');
        
        document.querySelectorAll('.mobile-submenu-content').forEach(content => {
            content.classList.add('hidden');
            content.style.maxHeight = '0';
        });
        
        document.querySelectorAll('.mobile-submenu-toggle').forEach(toggleBtn => {
            toggleBtn.classList.remove('active');
        });
        
        if (isHidden) {
            submenuContent.classList.remove('hidden');
            submenuContent.style.maxHeight = submenuContent.scrollHeight + 'px';
            toggle.classList.add('active');
        }
    }
    
    function handleResize() {
        if (window.innerWidth >= 1024) {
            initDesktopMenus();
        } else {
            document.querySelectorAll('.group').forEach(group => {
                group.replaceWith(group.cloneNode(true));
            });
        }
        
        if (window.innerWidth >= 768) {
            closeMobileMenu();
            
            document.querySelectorAll('.mobile-submenu-content').forEach(content => {
                content.classList.remove('hidden');
                content.style.maxHeight = '';
            });
            
            document.querySelectorAll('.mobile-submenu-toggle').forEach(toggleBtn => {
                toggleBtn.classList.remove('active');
            });
        }
        
        document.querySelectorAll('.mobile-submenu-content').forEach(content => {
            if (!content.classList.contains('hidden')) {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        });
    }
    
    function initNavigation() {
        mobileMenuButton = document.getElementById('mobile-menu-button');
        mobileMenu = document.getElementById('mobile-menu');
        mobileMenuIcon = document.getElementById('mobile-menu-icon');
        
        if (!mobileMenuButton || !mobileMenu || !mobileMenuIcon) return;
        
        desktopToggleButtons = document.querySelectorAll('.desktop-submenu-toggle');
        desktopToggleButtons.forEach(button => {
            button.addEventListener('click', handleDesktopToggleClick);
        });
        
        initDesktopMenus();
        
        documentClickHandler = handleDocumentClick;
        document.addEventListener('click', documentClickHandler);
        
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
        
        const mobileLinks = mobileMenu.querySelectorAll('a');
        mobileLinks.forEach(link => {
            link.addEventListener('click', handleMobileLinkClick);
        });

        submenuToggles = document.querySelectorAll('.mobile-submenu-toggle');
        submenuToggles.forEach(toggle => {
            toggle.addEventListener('click', handleSubmenuToggleClick);
        });
        
        resizeHandler = handleResize;
        window.addEventListener('resize', resizeHandler);
        
        window.addEventListener('orientationchange', function() {
            setTimeout(() => {
                document.querySelectorAll('.mobile-submenu-content').forEach(content => {
                    if (!content.classList.contains('hidden')) {
                        content.style.maxHeight = content.scrollHeight + 'px';
                    }
                });
            }, 300);
        });
    }
    
    function cleanupNavigation() {
        desktopToggleButtons.forEach(button => {
            button.removeEventListener('click', handleDesktopToggleClick);
        });
        
        if (mobileMenuButton) {
            mobileMenuButton.removeEventListener('click', toggleMobileMenu);
        }
        
        if (documentClickHandler) {
            document.removeEventListener('click', documentClickHandler);
        }
        
        if (resizeHandler) {
            window.removeEventListener('resize', resizeHandler);
        }
        
        const mobileLinks = mobileMenu ? mobileMenu.querySelectorAll('a') : [];
        mobileLinks.forEach(link => {
            link.removeEventListener('click', handleMobileLinkClick);
        });
        
        submenuToggles.forEach(toggle => {
            toggle.removeEventListener('click', handleSubmenuToggleClick);
        });
    }
    
    if (typeof window.RODINA === 'undefined') window.RODINA = {};
    window.RODINA.navigation = {
        init: initNavigation,
        cleanup: cleanupNavigation,
        closeMobileMenu: closeMobileMenu
    };
    
    if (document.readyState !== 'loading') {
        initNavigation();
    } else {
        document.addEventListener('DOMContentLoaded', initNavigation);
    }
})();