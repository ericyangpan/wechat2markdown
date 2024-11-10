import { chromium } from 'playwright';
import TurndownService from 'turndown';

export async function crawlWeChatArticle(url) {
  const browser = await chromium.launch({
    headless: true // Set to false for debugging
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('Loading page...');
    await page.goto(url, {
      waitUntil: 'networkidle'
    });

    // Wait for the article content to load
    await page.waitForSelector('#js_content');

    // Extract article title
    const title = await page.$eval(
      '#activity-name',
      el => el.textContent.trim()
    );

    // Extract article content
    const content = await page.$eval(
      '#js_content',
      el => {
        // Remove all script tags
        el.querySelectorAll('script').forEach(script => script.remove());
        
        // Let TurndownService handle the formatting
        return el.innerHTML;
      }
    );

    // Extract meta information
    const metaInfo = await page.evaluate(() => {
      const metaContent = document.querySelector('#meta_content');
      
      // Check if original
      const isOriginal = !!metaContent.querySelector('#copyright_logo');
      
      // Get author
      const author =
        metaContent.querySelector("#js_author_name")?.textContent.trim() ||
        metaContent.querySelector(".rich_media_meta_text")?.textContent.trim();
      
      // Get WeChat account name
      const subscriptionAccount = metaContent.querySelector('.rich_media_meta_nickname a')?.textContent.trim() || '';
      
      // Get publish time
      const publishTime = metaContent.querySelector('#publish_time')?.textContent.trim() || '';
      
      // Get location
      const location = metaContent.querySelector('#js_ip_wording')?.textContent.trim() || '';
      
      return {
        isOriginal,
        author,
        subscriptionAccount,
        publishTime,
        location,
      };
    });

    // Configure TurndownService
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
      emDelimiter: '*',
      bulletListMarker: '-'
    });

    // Add custom rule for tables
    turndownService.addRule('tables', {
      filter: ['table'],
      replacement: function(content, node) {
        const rows = node.querySelectorAll('tr');
        if (rows.length === 0) return '';

        let markdown = '\n\n';

        // Convert NodeList to Array before using forEach
        Array.from(rows).forEach((row, rowIndex) => {
          const cells = row.querySelectorAll('td, th');
          
          // Create table row
          markdown += '|' + Array.from(cells)
            .map(cell => ` ${cell.textContent.trim()} `)
            .join('|') + '|\n';
          
          // Add separator after header
          if (rowIndex === 0) {
            markdown += '|' + Array.from(cells)
              .map(() => ' --- ')
              .join('|') + '|\n';
          }
        });

        return markdown + '\n\n';
      }
    });

    // Add custom rule for WeChat images
    turndownService.addRule('images', {
      filter: ['img'],
      replacement: function (content, node) {
        // Try to get the best available image URL
        const imgUrl = node.getAttribute('data-src') || 
                      node.getAttribute('src');
        
        if (!imgUrl) return '';
        
        const altText = node.getAttribute('alt') || 'Image';
        return `\n\n![${altText}](${imgUrl})\n\n`;
      }
    });

    // Convert HTML to Markdown
    const markdown = turndownService.turndown(content);

    // Add meta information in front matter
    const markdownWithMeta = `---
url: ${url}
is_original: ${metaInfo.isOriginal}
author: ${metaInfo.author}
subscription_account: ${metaInfo.subscriptionAccount}
publish_time: ${metaInfo.publishTime}
location: ${metaInfo.location}
---

${markdown}`;

    return {
      title,
      content: markdownWithMeta,
      url,
      meta: metaInfo
    };
  } catch (error) {
    console.error('Error crawling article:', error);
    throw error;
  } finally {
    await browser.close();
  }
} 