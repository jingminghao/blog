import { defineConfig } from 'vitepress'

export default defineConfig({
  lang: 'zh-CN',
  title: 'jingmh的博客',
  description: '整理工作随记，沉淀可复用的工程经验',
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: '文章', link: '/posts/' }
    ],
    sidebar: [
      {
        text: '开始阅读',
        items: [
          { text: '站点说明', link: '/guide/' }
        ]
      },
      {
        text: '文章',
        items: [
          { text: '工作随记', link: '/posts/work-notes' }
        ]
      }
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/yourusername' }]
  }
})
