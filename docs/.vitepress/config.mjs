import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "静儿的博客",
  description: "A VitePress Site",
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: '博客', link: '/posts/' }
    ],
    sidebar: [
      {
        text: '指南',
        items: [
          { text: '介绍', link: '/guide/' }
        ]
      },
      {
        text: '博客',
        items: [
          { text: '第一篇文章', link: '/posts/first-post' }
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/yourusername' }
    ]
  }
})
