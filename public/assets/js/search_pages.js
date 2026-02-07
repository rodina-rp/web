(function() {
    const searchElements = [
        {
            input: document.getElementById('search-input'),
            results: document.getElementById('results-container'),
            type: 'desktop'
        },
        {
            input: document.getElementById('mobile-search-input'),
            results: document.getElementById('mobile-results-container'),
            type: 'mobile'
        }
    ];

    let searchIndex = [];
    let isIndexLoaded = false;
    
    async function loadSearchIndex() {
        if (isIndexLoaded) return searchIndex;
        
        try {
            const response = await fetch('/web/search.json');
            if (!response.ok) {
                throw new Error('Не удалось загрузить search.json');
            }
            
            const text = await response.text();
            
            if (!text.trim().startsWith('[') && !text.trim().startsWith('{')) {
                throw new Error('Неверный формат JSON');
            }
            
            searchIndex = JSON.parse(text);
            isIndexLoaded = true;
            console.log('Индекс загружен успешно. Записей:', searchIndex.length);
            
            return searchIndex;
        } catch (error) {
            console.error('Ошибка загрузки индекса:', error);
            searchIndex = [
                {
                    title: "Тестовая страница",
                    url: "/laws/pdd/",
                    content: "Правила дорожного движения 1.1 Государственная дорога населенного пункта 80 км.ч (+19); 1.2 Государственная дорога между населенными пунктами 110 км.ч (+19);"
                }
            ];
            isIndexLoaded = true;
            return searchIndex;
        }
    }

    function findContext(text, query, chars = 60) {
        if (!text || !query) return text || '';
        
        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        const index = lowerText.indexOf(lowerQuery);
        
        if (index === -1) {
            return text.substring(0, chars * 2) + (text.length > chars * 2 ? '...' : '');
        }
        
        const start = Math.max(0, index - chars);
        const end = Math.min(text.length, index + query.length + chars);
        let result = text.substring(start, end);
        
        if (start > 0) result = '...' + result;
        if (end < text.length) result = result + '...';
        
        return result;
    }

    function highlightText(text, query) {
        if (!text || !query) return text;
        
        try {
            const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            return text.replace(regex, '<span class="highlight">$1</span>');
        } catch (e) {
            return text;
        }
    }

    async function performSearch(query, resultsContainer) {
        if (!query || !query.trim()) {
            if (resultsContainer) {
                resultsContainer.innerHTML = '';
                resultsContainer.classList.add('hidden');
            }
            return;
        }
        
        const searchQuery = query.trim().toLowerCase();
        
        const index = await loadSearchIndex();
        if (!index || index.length === 0) {
            if (resultsContainer) {
                resultsContainer.innerHTML = '<div class="p-3 text-gray-400 text-center text-sm">Индекс поиска пуст</div>';
                resultsContainer.classList.remove('hidden');
            }
            return;
        }
        
        const results = index.filter(item => {
            if (!item.title && !item.content) return false;
            
            const searchText = (item.title + ' ' + item.content).toLowerCase();
            return searchText.includes(searchQuery);
        }).slice(0, 5);
        
        displayResults(results, resultsContainer, searchQuery);
    }

    function displayResults(results, container, query) {
        if (!container) return;
        
        container.innerHTML = '';
        
        if (results.length === 0) {
            container.innerHTML = '<div class="p-3 text-gray-400 text-center text-sm">Ничего не найдено</div>';
            container.classList.remove('hidden');
            return;
        }
        
        results.forEach(item => {
            const resultElement = document.createElement('a');
            resultElement.href = item.url.startsWith('/') ? item.url : '/' + item.url;
            resultElement.className = 'search-result-item';
            
            const context = findContext(item.content, query, 35);
            const highlightedTitle = highlightText(item.title, query);
            const highlightedContent = highlightText(context, query);
            
            resultElement.innerHTML = `
                <div class="search-result-title">${highlightedTitle || 'Без названия'}</div>
                <div class="search-result-preview">${highlightedContent || ''}</div>
            `;
            
            container.appendChild(resultElement);
        });
        
        const showAllLink = document.createElement('a');
        showAllLink.href = `/web/search-results/?q=${encodeURIComponent(query)}`;
        showAllLink.className = 'show-all-results';
        showAllLink.textContent = `Показать все результаты (${results.length})`;
        container.appendChild(showAllLink);
        
        container.classList.remove('hidden');
    }

    function initSearch() {
        searchElements.forEach(({input, results, type}) => {
            if (!input || !results) {
                console.warn(`${type}: Не найден input или results`);
                return;
            }
            
            let timeoutId;
            
            input.addEventListener('input', function(e) {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    performSearch(e.target.value, results);
                }, 200);
            });
            
            input.addEventListener('focus', function() {
                this.style.borderColor = '#ef4444';
            });
            
            input.addEventListener('blur', function() {
                this.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            });
            
            document.addEventListener('click', (e) => {
                const searchContainer = input.closest('#search-container, #mobile-search-container');
                if (!searchContainer?.contains(e.target)) {
                    results.classList.add('hidden');
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    results.classList.add('hidden');
                    input.blur();
                }
            });
        });

        setTimeout(() => loadSearchIndex(), 500);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSearch);
    } else {
        initSearch();
    }
})();