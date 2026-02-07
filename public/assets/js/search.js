(function() {
    let searchInput = null;
    let resultsContainer = null;
    let noResults = null;
    let loading = null;
    let searchIndex = [];
    
    async function loadSearchIndex() {
        try {
            const response = await fetch('/web/search.json');
            return await response.json();
        } catch {
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
        } catch {
            return text;
        }
    }
    
    function cleanText(text) {
        if (!text) return '';
        return text.replace(/\s+/g, ' ').trim();
    }
    
    function fixUrl(url) {
        const basePath = '/web';
        if (url.startsWith(`${basePath}${basePath}`)) {
            return url.replace(`${basePath}${basePath}`, basePath);
        }
        return url;
    }
    
    async function performFullSearch(query) {
        if (!query.trim()) {
            resultsContainer.innerHTML = '';
            if (noResults) noResults.classList.remove('hidden');
            if (loading) loading.classList.add('hidden');
            return;
        }
        
        if (loading) loading.classList.remove('hidden');
        if (noResults) noResults.classList.add('hidden');
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
    
    function displayFullResults(results, query) {
        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            if (noResults) noResults.classList.remove('hidden');
            return;
        }
        
        if (noResults) noResults.classList.add('hidden');
        
        results.forEach(item => {
            const card = document.createElement('div');
            card.className = 'bg-dark-bg/50 border border-primary-red/30 rounded-lg p-6 hover:border-primary-red/50 transition-colors';
            
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
                <a href="${fixedUrl}" class="inline-flex items-center text-primary-red hover:text-red-400 transition-colors">
                    <span>Перейти к странице</span>
                    <i class="fas fa-arrow-right ml-2"></i>
                </a>
            `;
            
            resultsContainer.appendChild(card);
        });
    }
    
    function handleInput(e) {
        const query = e.target.value.trim();
        if (query) {
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('q', query);
            window.history.replaceState({}, '', newUrl);
            
            performFullSearch(query);
        } else {
            resultsContainer.innerHTML = '';
            if (noResults) noResults.classList.remove('hidden');
            if (loading) loading.classList.add('hidden');
        }
    }
    
    function handleKeyPress(e) {
        if (e.key === 'Enter') {
            const query = e.target.value.trim();
            if (query) {
                const newUrl = new URL(window.location);
                newUrl.searchParams.set('q', query);
                window.location.href = newUrl.toString();
            }
        }
    }
    
    function initSearch() {
        searchInput = document.getElementById('full-search-input');
        resultsContainer = document.getElementById('search-results');
        noResults = document.getElementById('no-results');
        loading = document.getElementById('loading');
        
        if (!searchInput || !resultsContainer) return;
        
        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('q');
        
        if (searchQuery) {
            searchInput.value = decodeURIComponent(searchQuery);
            performFullSearch(searchQuery);
        }
        
        searchInput.addEventListener('input', handleInput);
        searchInput.addEventListener('keypress', handleKeyPress);
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