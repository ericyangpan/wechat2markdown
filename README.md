# wechat2markdown

Convert WeChat Subscription Account Article to Markdown.

Why build this?

I frequently write articles using Cursor and often need to convert WeChat Subscription Account content into Markdown format for reference purposes.

Therefore, I quickly built this project using Cursor to accomplish this task 🎉.

# Usage

Install dependencies:

```bash
npm install
```
Install globally:

```bash
npm install -g
```

Convert WeChat Subscription Account Article to Markdown:

```bash
wechat2markdown <url>
```

```bash
% wechat2markdown "https://mp.weixin.qq.com/s/xXugkCnL0bQy9-6FTDuqHA" 
Processing URL: https://mp.weixin.qq.com/s/xXugkCnL0bQy9-6FTDuqHA
Loading page...
Article title: GPT-4o 发布，「AI 时代」我们需要什么耳机？
Content saved to: GPT-4o 发布，「AI 时代」我们需要什么耳机？.md
```

Output file will be saved in the current directory.


Powered by [Playwright](https://playwright.dev/) and [Turndown](https://github.com/domchristie/turndown).

Built with [Cursor](https://www.cursor.com/).
