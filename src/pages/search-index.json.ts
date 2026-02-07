import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const GET: APIRoute = async () => {
  const searchIndex = [];
  
  try {
    const astroFiles = import.meta.glob('/src/pages/**/*.astro');
    
    for (const filePath in astroFiles) {
      try {
        
        let shouldExclude = false;
        let excludeReason = '';
        
        
        const fullExcludePaths = [
          '/src/pages/search.astro',      
          '/src/pages/map.astro',         
          '/src/pages/404.astro',         
          '/src/pages/index.astro'        
        ];
        
        
        const partialExcludePaths = [
          '/src/pages/factions/index.astro',  
          '/src/pages/laws/index.astro',      
          '/src/pages/rules/index.astro'      
        ];
        
        
        for (const excludePath of fullExcludePaths) {
          if (filePath === excludePath) {
            shouldExclude = true;
            excludeReason = `Полное исключение: ${excludePath}`;
            break;
          }
        }
        
        
        for (const excludePath of partialExcludePaths) {
          if (filePath === excludePath) {
            shouldExclude = true;
            excludeReason = `Исключение индексной страницы категории: ${excludePath}`;
            break;
          }
        }
        
        if (shouldExclude) {
          console.log(`Пропускаем файл: ${filePath} (${excludeReason})`);
          continue;
        }
        
        
        
        
        let title = 'Без названия';
        let description = '';
        let content = '';
        
        const rawContent = await fs.readFile(
          path.join(process.cwd(), filePath.slice(1)), 
          'utf-8'
        );
        
        const frontmatterMatch = rawContent.match(/^---\s*\n([\s\S]*?)\n---/);
        
        if (frontmatterMatch) {
          const frontmatter = frontmatterMatch[1];
          
          const titleMatch = frontmatter.match(/title:\s*["']([^"']+)["']/) || 
                           frontmatter.match(/title:\s*([^\n]+)/) ||
                           frontmatter.match(/const title\s*=\s*["']([^"']+)["']/);
          
          if (titleMatch) {
            title = titleMatch[1].trim();
          }
          
          const descMatch = frontmatter.match(/description:\s*["']([^"']+)["']/);
          if (descMatch) {
            description = descMatch[1];
          }
        }
        
        const htmlContent = rawContent.replace(/^---\s*\n[\s\S]*?\n---/, '');
        
        const cleanedContent = htmlContent
          .replace(/import[^;]+;/g, '')
          .replace(/<[A-Z][^>]*\/?>/g, '')
          .replace(/<\/?[A-Z][^>]*>/g, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/g, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        content = cleanedContent.substring(0, 5000);
        
        
        let url = filePath
          .replace('/src/pages', '')
          .replace('/index.astro', '')
          .replace('.astro', '')
          .replace(/\[([^\]]+)\]/g, ':$1');
        
        if (url === '') url = '/';
        
        
        if (url === '/') {
          url = '/web/';
        } else {
          url = '/web' + (url.startsWith('/') ? url : '/' + url);
        }
        
        
        let category = 'Другое';
        if (filePath.includes('/factions/')) category = 'Фракции';
        else if (filePath.includes('/laws/')) category = 'Законы';
        else if (filePath.includes('/rules/')) category = 'Правила';
        else if (url === '/web/map' || filePath.includes('/map.astro')) category = 'Карта';
        else if (url === '/web/') category = 'Главная';
        
        searchIndex.push({
          id: url,
          title,
          description,
          content,
          url, 
          category,
          weight: getPageWeight(url, category, cleanedContent.length)
        });
        
        console.log(`Индексирована страница: ${title} -> ${url} (${category})`);
        
      } catch (err) {
        console.error(`Ошибка обработки файла ${filePath}:`, err);
      }
    }
    
    console.log(`Сгенерирован индекс для ${searchIndex.length} страниц`);
    
    
    searchIndex.sort((a, b) => b.weight - a.weight);
    
    return new Response(JSON.stringify(searchIndex, null, 2), {
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600'
      }
    });
    
  } catch (error) {
    console.error('Ошибка генерации индекса:', error);
    return new Response(JSON.stringify({ error: 'Ошибка генерации индекса' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

function getPageWeight(url: string, category: string, contentLength: number): number {
  let weight = 1;
  
  
  if (category === 'Законы') weight = 8;
  else if (category === 'Правила') weight = 7;
  else if (category === 'Фракции') weight = 6;
  else if (category === 'Карта') weight = 5;
  
  
  if (contentLength > 5000) weight += 2;
  else if (contentLength > 2000) weight += 1;
  
  
  const priorityKeywords = ['конституция', 'правила', 'главная', 'фракции', 'законы'];
  const lowerTitle = url.toLowerCase();
  for (const keyword of priorityKeywords) {
    if (lowerTitle.includes(keyword)) {
      weight += 1;
      break;
    }
  }
  
  return weight;
}