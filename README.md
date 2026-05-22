# blog




---
- Cloudflare + pages + VitePress  怎么实

> 1.创建个项目并初始化 vitepress
```
  mkdir blog
  cd blog
  npm init -y
  npm install vitepress
```
  
- 2.本地运行
````
npm run dev
npm run docs:build
````

- 3.部署
```
 Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git。

Framework preset: VitePress（如果没有就选 None）
Build command: npm run build
Build output directory: docs/.vitepress/dist
Root directory: 留空（项目根目录）
Node.js version: 建议 20

保存并部署。首次成功后，之后每次 push 到 main 会自动重新部署。
```

- 4.开启访问口令（环境变量）
```
本项目已包含 Cloudflare Pages Functions 鉴权中间件：functions/_middleware.js

在 Cloudflare Pages 项目中设置 Secrets（Production/Preview 都建议设置）：
- SITE_USERNAME = 你的登录名
- SITE_PASSWORD = 你的访问口令

设置位置：Pages 项目 -> Settings -> Variables and Secrets -> Add variable -> 选择 Secret

保存后重新部署。访问站点时会弹出浏览器登录框，输入正确用户名/口令才能访问。
```
  
  
  