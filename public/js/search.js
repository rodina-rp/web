(function() {
    let searchInput = null;
    let resultsContainer = null;
    let noResults = null;
    let loading = null;
    let searchIndex = [];
    
    async function loadSearchIndex() {
        try {
            const response = await fetch('/web/search-index.json');
            return await response.json();
        } catch (error) {
            console.error('Ошибка загрузки индекса поиска:', error);
            return [];
        }
    }
    
    function findContext(text, query, chars = 100) {
        if (!text || !query) return text || '';
        
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerText.indexOf(lowerQuery);
        
        if (index === -1) {
            return text.substring(0, chars) + (text.length > chars ? '...' : '');
        }
        
        const start = Math.max(0, index - 30);
        const end = Math.min(text.length, index + lowerQuery.length + 70);
        let result = text.substring(start, end);
        
        if (start > 0) result = '...' + result;
        if (end < text.length) result = result + '...';
        
        return result;
    }
    
    function highlightText(text, query) {
        if (!text || !query) return text;
        
        try {
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedQuery})`, 'gi');
            return text.replace(regex, '<span class="bg-primary-red/30 text-white px-1 rounded">$1</span>');
        } catch (error) {
            console.error('Ошибка при подсветке текста:', error);
            return text;
        }
    }
    
    function cleanText(text) {
        if (!text) return '';
        return text.replace(/\s+/g, ' ').trim();
    }
    
    function fixUrl(url) {
        if (!url) return url;
        
        if (url.startsWith('/web')) {
            return url;
        }
        
        if (url.startsWith('http') || url.startsWith('#')) {
            return url;
        }
        
        return '/web' + (url.startsWith('/') ? url : '/' + url);
    }
    
    async function performFullSearch(query) {
        if (!query.trim()) {
            showDefaultMessage();
            if (loading) loading.classList.add('hidden');
            return;
        }
        
        if (loading) loading.classList.remove('hidden');
        resultsContainer.innerHTML = '';
        
        searchIndex = await loadSearchIndex();
        if (searchIndex.length === 0) {
            resultsContainer.innerHTML = '<div class="text-center py-8 text-gray-400">Индекс поиска не загружен</div>';
            if (loading) loading.classList.add('hidden');
            return;
        }
        
        const normalizedQuery = query.toLowerCase().trim();
        const results = searchIndex.filter(item => {
            const searchText = (item.title + ' ' + item.content).toLowerCase();
            return searchText.includes(normalizedQuery);
        });
        
        setTimeout(() => {
            displayFullResults(results, query);
            if (loading) loading.classList.add('hidden');
        }, 300);
    }
    
    function showDefaultMessage() {
        resultsContainer.innerHTML = `
            <div id="advanced-no-results" class="text-center py-16 text-gray-500">
                <i class="fas fa-search text-5xl mb-6 opacity-50"></i>
                <p class="text-lg">Введите поисковый запрос выше</p>
            </div>
        `;
    }
    
    function displayFullResults(results, query) {
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="text-center py-16 text-gray-500">
                    <i class="fas fa-search text-5xl mb-6 opacity-50"></i>
                    <p class="text-lg">Ничего не найдено для "${query}"</p>
                </div>
            `;
            return;
        }
        
        results.forEach(item => {
            const card = document.createElement('div');
            card.className = 'bg-dark-bg/50 border border-primary-red/30 rounded-lg p-6 hover:border-primary-red/50 transition-colors mb-6';
            
            const cleanTitle = cleanText(item.title);
            const cleanContent = cleanText(item.content);
            const context = findContext(cleanContent, query, 100);
            
            const highlightedTitle = highlightText(cleanTitle, query);
            const highlightedContent = highlightText(context, query);
            
            const fixedUrl = fixUrl(item.url);
            
            card.innerHTML = `
                <h3 class="text-xl font-bold mb-3" style="margin-top: 0;">
                    <a href="${fixedUrl}" class="text-white hover:text-primary-red transition-colors">${highlightedTitle}</a>
                </h3>
                <div class="text-gray-400 mb-4">
                    ${highlightedContent}
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-500">${item.category || 'Другое'}</span>
                    <a href="${fixedUrl}" class="inline-flex items-center text-primary-red hover:text-red-400 transition-colors">
                        <span>Перейти к странице</span>
                        <i class="fas fa-arrow-right ml-2"></i>
                    </a>
                </div>
            `;
            
            resultsContainer.appendChild(card);
        });
    }
    
    function handleInput(e) {
        const query = e.target.value.trim();
        const clearButton = document.getElementById('advanced-clear-search');
        if (clearButton) {
            if (query) {
                clearButton.classList.remove('hidden');
            } else {
                clearButton.classList.add('hidden');
            }
        }
        
        if (query) {
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('q', query);
            window.history.replaceState({}, '', newUrl);
            
            performFullSearch(query);
        } else {
            showDefaultMessage();
            if (loading) loading.classList.add('hidden');
        }
    }
    
    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) {
                if (window.location.pathname.includes('/search')) {
                    const newUrl = new URL(window.location);
                    newUrl.searchParams.set('q', query);
                    window.history.replaceState({}, '', newUrl);
                    performFullSearch(query);
                } else {
                    window.location.href = `/web/search?q=${encodeURIComponent(query)}`;
                }
            }
        }
    }
    
    function initSearch() {
        searchInput = document.getElementById('advanced-search-input');
        resultsContainer = document.getElementById('advanced-search-results');
        loading = document.getElementById('advanced-loading');
        
        if (!searchInput || !resultsContainer) {
            console.error('Не найдены необходимые элементы на странице поиска');
            return;
        }
        
        const clearButton = document.getElementById('advanced-clear-search');
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                searchInput.value = '';
                clearButton.classList.add('hidden');
                showDefaultMessage();
                const newUrl = new URL(window.location);
                newUrl.searchParams.delete('q');
                window.history.replaceState({}, '', newUrl);
            });
        }
        
        const toggleFiltersButton = document.getElementById('advanced-toggle-filters');
        const filtersContainer = document.getElementById('advanced-filters');
        if (toggleFiltersButton && filtersContainer) {
            toggleFiltersButton.addEventListener('click', () => {
                filtersContainer.classList.toggle('hidden');
            });
        }
        
        const resetFiltersButton = document.getElementById('advanced-reset-filters');
        if (resetFiltersButton) {
            resetFiltersButton.addEventListener('click', () => {
                document.getElementById('advanced-category-filter').value = '';
                document.getElementById('advanced-sort-filter').value = 'relevance';
            });
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q');
        
        if (searchQuery) {
            searchInput.value = decodeURIComponent(searchQuery);
            if (clearButton) clearButton.classList.remove('hidden');
            performFullSearch(searchQuery);
        } else {
            showDefaultMessage();
        }
        
        searchInput.addEventListener('input', handleInput);
        searchInput.addEventListener('keypress', handleKeyPress);
        
        searchInput.focus();
    }
    
    if (typeof window.RODINA === 'undefined') window.RODINA = {};
    window.RODINA.search = {
        init: initSearch,
        performSearch: performFullSearch
    };
    
    if (document.readyState !== 'loading') {
        initSearch();
    } else {
        document.addEventListener('DOMContentLoaded', initSearch);
    }
})();