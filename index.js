#!/usr/bin/env node

import { Command } from 'commander';
import { crawlWeChatArticle } from './crawler.js';
import fs from 'fs/promises';

const program = new Command();

program
  .version('1.0.0')
  .description('WeChat Official Account Article Markdown Converter')

const url = process.argv[2];

if (!url) {
  console.error('Please provide a WeChat article URL');
  process.exit(1);
}

console.log('Processing URL:', url);

try {
  const article = await crawlWeChatArticle(url);
  console.log('Article title:', article.title);
  
  // Generate filename from article title
  const filename = `${article.title.replace(/[<>:"/\\|?*]/g, '_')}.md`;
  await fs.writeFile(filename, article.content);
  console.log('Content saved to:', filename);
} catch (error) {
  console.error('Failed to process article:', error);
  process.exit(1);
}
