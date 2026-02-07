window.loadMiniSearch = async function() {
  if (window.MiniSearch) return window.MiniSearch;
  
  try {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/minisearch@6.3.0/dist/umd/index.min.js';
    script.crossOrigin = 'anonymous';
    
    return new Promise((resolve, reject) => {
      script.onload = () => {
        console.log('MiniSearch загружен с CDN');
        resolve(window.MiniSearch);
      };
      script.onerror = () => {
        console.warn('Не удалось загрузить MiniSearch с CDN, используется резервный метод');
        window.MiniSearch = class MiniSearchStub {
          constructor(options = {}) {
            this.options = options;
            this.documents = new Map();
          }
          addAll(docs) {
            docs.forEach(doc => this.documents.set(doc.id, doc));
            return this;
          }
          search(query, options = {}) {
            const results = [];
            const queryLower = query.toLowerCase();
            
            for (const [id, doc] of this.documents.entries()) {
              let score = 0;
              const text = (doc.title + ' ' + doc.content + ' ' + doc.category).toLowerCase();
              
              if (text.includes(queryLower)) {
                score = 1;
                if (doc.title.toLowerCase().includes(queryLower)) score += 2;
                if (doc.category.toLowerCase().includes(queryLower)) score += 1;
                
                results.push({
                  id,
                  score,
                  terms: [queryLower],
                  query: queryLower,
                  match: {}
                });
              }
            }
            
            results.sort((a, b) => b.score - a.score);
            return options.limit ? results.slice(0, options.limit) : results;
          }
          getDocument(id) {
            return this.documents.get(id);
          }
        };
        resolve(window.MiniSearch);
      };
      
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('Ошибка загрузки MiniSearch:', error);
    return null;
  }
};