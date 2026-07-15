# 工作随记

> 这篇文章从工作随记中提炼而来，只保留适合公开沉淀的通用经验；账号、口令、内网地址、密钥等敏感内容已全部模糊、剔除。


## 1.域名 | cloudflare
::: info 免费域名
> 地址：https://my.dnshe.com/
>
> 账号：QQ邮箱  密码：Ppxxxxxx
> 
> **jmh.ccwu.cc** 、 **jingmh.ccwu.cc**
:::


::: info cloudflare
> qq邮箱注册 
https://dash.cloudflare.com/
网关（机场）

- 网关：（v2ray）**https://gateway.jmh.ccwu.cc/admin** **https://jingmh-gateway.pages.dev/admin** 
> admin123456
- 博客： **https://blog.jmh.ccwu.cc**  **https://jingmh-blog.pages.dev**
> admin   admin123456
- 门户网站：**https://jingmh-portal.jmh.ccwu.cc**   **jingmh-admin.pages.dev**     
- 门户网站后端： **https://portal.jmh.ccwu.cc** （指向本地的服务）

:::


## 2.VM | Liunx | docker | windows

::: info docker 配置VPN代理
> 在 VM 中创建或编辑 Docker 的服务配置目录：
```bash
sudo mkdir -p /etc/systemd/system/docker.service.d
sudo vim /etc/systemd/system/docker.service.d/http-proxy.conf
```

> 在文件中粘贴以下内容（请将 192.168.X.X:7890 替换为你实际的代理服务器 IP 和端口）：

```txt
[Service]
Environment="HTTP_PROXY=http://192.168.12.39:10808/"
Environment="HTTPS_PROXY=http://192.168.12.39:10808/"
Environment="NO_PROXY=localhost,127.0.0.1,172.17.0.1"
```

```bash
sudo systemctl daemon-reload
sudo systemctl restart docker
```
:::

::: info Liunx 配置VPN代理
> 判断代理是否可以，可用返回200
> curl --ssl-no-revoke -o nul -s -w "%{http_code}" -x http://192.168.12.39:10808 https://www.google.com

- 临时 （当前会话可用）
```bash
export http_proxy=http://192.168.12.39:10808
export https_proxy=http://192.168.12.39:10808
export HTTP_PROXY=http://192.168.12.39:10808
export HTTPS_PROXY=http://192.168.12.39:10808
```
- 清除代理
```bash
unset http_proxy
unset https_proxy
unset HTTP_PROXY
unset HTTPS_PROXY
```
- 查看代理
```bash
echo $http_proxy
echo $https_proxy
echo $HTTP_PROXY
echo $HTTPS_PROXY

```
- 测试
```bash
curl -I https://www.google.com
```

- 永久 （配置后重新登陆）

```bash
sudo nano /etc/environment
```
> 末尾添加如下（Java 开发环境（Git、Maven、Docker、curl、apt 都会用），推荐直接全配）
```bash
export http_proxy=http://192.168.12.39:10808
export https_proxy=http://192.168.12.39:10808
export HTTP_PROXY=http://192.168.12.39:10808
export HTTPS_PROXY=http://192.168.12.39:10808
export no_proxy=localhost,127.0.0.1,192.168.12.0/24
export NO_PROXY=localhost,127.0.0.1,192.168.12.0/24
````
> nano：保存ctrl+o、退出ctrl+x、剪切一行ctrl+k、粘贴ctrl+u、搜索ctrl+w
- 配置后重新登陆 
```bash
exit   
su - root
```
:::


::: info GitHub 推荐用 SSH，后面自动部署、git pull、git push 都方便，不用反复输 Token。
```
生成 SSH key，按回车...
ssh-keygen -t ed25519 -C "1138606085@qq.com"

查看公钥
cat ~/.ssh/id_ed25519.pub

然后到 GitHub，把公钥粘进去（选可以类型选【Authentication Key】）
头像 → Settings → SSH and GPG keys → New SSH key

测试，要输入下yes（信任电脑）ssh -vT git@github.com
ssh -T git@github.com

通了后就可以下载了，注意是ssh的链接
git clone git@github.com:jingminghao/jingmh_portal.git
```




:::

::: info docker 项目推送自动部署

:::


## 3.内网穿透
### 3.1 使用cloudflare的Zero Trust

::: info 
> Zero Trust -> 网络 -> 连接器
- 让整个 VM 的 Docker 走代理
第一步：在 Cloudflare 控制台创建 Tunnel
第二步：在本地 VM 中安装并运行 Cloudflared 客户端
```bash
docker run cloudflare/cloudflared:latest tunnel \
--name cloudflared
--restart=always \
--no-autoupdate run \
--token eyJhIjoiNjdkMDMxMTAyYjY4Nzg0OTAxYWFlZTJiOTg2MjNiODEiLCJ0IjoiMTEwMTk0ZGYtZjUwNi00ZGFiLTgyMTItOTdkMmE5YmU4ZDMxIiwicyI6IllqVXdabUZtTkRjdE1tRXdNUzAwWXpnNExXSmpaRFF0WkRBelptWmxaamMxWW1ZNSJ9
```
> 这个是复制自己当前的，位置：Zero Trust -> 网络 -> 连接器 -> 创建的隧道 -> 添加连接器 -> 设备操作系统docker 

第三部：配置路由（将域名绑定到 VM 服务）
```txt
1.在当前的“连接器”页面中，找到 jingmh-tunnel-01 那一行的三个点 ...然后点击配置。
2.在弹出的菜单中选择 “已发布应用程序路由”-> “添加已发布应用程序路由”。

子域名 (Subdomain)：填写 portal（或者你想用的 protal）。
域 (Domain)：点击下拉菜单，选择你的主域名 jmh.ccwu.cc。
路径 (Path)：留空，什么都不填。
服务 (Service)：
类型 (Type)：在下拉菜单里选择 HTTP。
URL / 目标 (Target)：填写 172.17.0.1:你的Docker程序外部映射端口（例如，如果你的 Docker 网页程序映射到虚拟机的端口是 8080，就填 172.17.0.1:8080）。
```

第四步：测试访问
```bash
ssh -o ProxyCommand="cloudflared access ssh --hostname vm.yourdomain.com" user@vm.yourdomain.com
```

:::




## 4. git 常用命令

- 查看当前分支

```bash
git branch --show-current

```

- git强制本地分支推到中讯科
```bash
git push origin 中讯科 --force
```

- 放弃本地已提交的，还原到远程仓库当前版本
```bash
git reset --hard origin/prod-20260609-jingmh-导出平台中所有涉及到中文的内容
```

- 关联分支
> git branch --set-upstream-to origin/远程分支 本地分支
```bash
git branch --set-upstream-to origin/prod prod
```

- git 回滚到指定提交节点
```bash
git reset --hard a7fbec756883947cf2d1e5521f2fbe7dec9c7106
```

- 强制推送到远程仓库，以覆盖远程分支的历史  dev 是分支
```bash
git push origin dev --force
```

- 修改远程分支名字
```bash 
1. 修改本地分支名字
git branch -m nj-hospital  dev

2. 推送到远程分支
git  push  origin  dev

3. 本地分支与新分支相连 将本地 online 分支与远端 prod 分支关联
git pull origin prod --allow-unrelated-histories 
git branch --set-upstream-to=origin/prod online

4. 删除旧分分支 
git push --delete origin nj-hospital

```

- 打标签
```bash
1.先切到自己要的分支

2.git tag -a 20251117_1051_dev -m "20251117_1051_dev"

3.git push origin 20251117_1051_dev
```


## 11111
- 指定外部配置

```bash
java -jar app.jar --spring.config.location=/path/to/application.yml
```

CMD cmd中文乱码
chcp 65001

项目启动时，几个常见入口的语义并不一样：

- `@PostConstruct`：Bean 初始化后立即执行，适合轻量初始化，不适合耗时任务。
- `CommandLineRunner` / `ApplicationRunner`：Spring Boot 启动流程中的运行器，执行失败会影响应用启动结果。
- `ApplicationStartedEvent`：容器已经启动，但运行器可能还没执行。
- `ApplicationReadyEvent`：应用已经准备就绪，更适合做“启动后再执行”的动作。

### 实战建议

- 耗时逻辑不要放进 `@PostConstruct`。
- 需要确保系统完全可用后再触发的任务，优先监听 `ApplicationReadyEvent`。
- 如果初始化逻辑失败不能阻止系统对外提供服务，就不要把它写在强耦合的启动链路里。

## 2. 启动参数和远程调试很有用

### 指定外部配置



当配置需要和包分离部署时，这个参数很实用。

### 开启远程调试

```bash
java \
  -agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5006 \
  -Dfile.encoding=UTF-8 \
  -jar app.jar
```

适合定位线上或测试环境的特定问题，但要注意端口暴露风险，正式环境必须配合访问控制。

### 定时任务线程池不要偷懒

```java
@Bean
public TaskScheduler taskScheduler() {
    ThreadPoolTaskScheduler taskScheduler = new ThreadPoolTaskScheduler();
    taskScheduler.setPoolSize(50);
    return taskScheduler;
}
```

如果定时任务较多，默认线程模型容易把问题藏起来。线程池大小需要结合任务数量、执行耗时和机器资源来调。

## 3. Windows 排障要会几条基础命令

### 端口占用排查

```powershell
netstat -ano
netstat -aon | findstr "8081"
tasklist | findstr "6120"
```

思路通常是：

1. 先看端口被哪个 PID 占用。
2. 再看 PID 对应哪个进程。
3. 确认影响范围后再决定是否结束进程。

### 控制台中文乱码

```powershell
chcp 65001
```

如果只是临时查看中文输出，这个命令很直接；如果项目经常出现乱码，更该回头检查文件编码、控制台编码和 JVM 编码是否一致。

## 4. Java 项目里的编码和时区要统一

### JVM 时区与业务时区

```bash
java -Duser.timezone=Asia/Shanghai -jar app.jar
```

这能解决一部分“服务器时间没问题，但程序读出来不对”的问题。

### Jackson 时区要单独确认

```yaml
spring:
  jackson:
    time-zone: Asia/Shanghai
```

经验上，很多“时间差 8 小时”不是数据库错，也不是系统时钟错，而是序列化层和 JVM 时区不一致。

### 日期格式输出

```java
@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
```

这个注解适合局部字段控制，但如果全局规则明确，优先做统一配置。

## 5. NSSM 很适合把脚本托管成 Windows 服务

常见命令：

```bash
nssm install <service-name>
nssm start <service-name>
nssm stop <service-name>
nssm restart <service-name>
nssm remove <service-name> confirm
```

适用场景：

- Java 程序通过 `.bat` 启动
- 需要开机自启
- 不想手工点脚本

如果团队长期在 Windows 服务器上部署内部程序，NSSM 基本是很实用的一层托管工具。

## 6. Docker 和 Nginx 的经验要沉淀成模板

### Nginx 容器常见挂载点

```bash
docker run --name nginx -p 80:80 \
  -v /path/nginx.conf:/etc/nginx/nginx.conf \
  -v /path/conf.d:/etc/nginx/conf.d \
  -v /path/html:/usr/share/nginx/html \
  -v /path/logs:/var/log/nginx:ro \
  -d nginx:1.20.2
```

几个关键点：

- 配置、静态文件、日志目录最好分开挂载。
- `:ro` 适合日志或时间文件这类只读场景。
- 如果只是本机调试，端口映射通常比 `--net host` 更清晰。

### 静态资源缓存策略

```nginx
location ^~ /app/ {
  if_modified_since exact;
  etag on;
  add_header Cache-Control "public, max-age=0, must-revalidate" always;
  gzip on;
  gzip_vary on;
  gzip_proxied any;
  gzip_buffers 32 4k;
  gzip_comp_level 6;
  gzip_min_length 100;
  gzip_types application/javascript text/css text/xml;
  gzip_static on;
}
```

前端静态资源更新异常，很多时候不是“没发版”，而是缓存策略没配清楚。

## 7. Elasticsearch 的 403 和只读索引，通常不是表面问题

遇到日志写入 `403` 或索引被锁定时，优先排查两类原因：

- 磁盘空间触发 flood stage，索引被自动设为只读。
- 模板或 mapping 不兼容，导致写入失败后又伴随状态异常。

### 解除只读

```bash
curl -X PUT "http://localhost:9200/your-index/_settings" \
  -H "Content-Type: application/json" \
  -d "{\"index\":{\"blocks\":{\"read_only_allow_delete\":\"false\"}}}"
```

### 排查方向

- 先确认磁盘空间是否接近阈值。
- 再检查模板字段类型是否兼容当前 ES 版本。
- 不要只处理症状，模板错误不修，索引还会继续出问题。

## 8. Maven 编译异常时，不要只会点 IDEA

有些场景下，源码明明在，启动却提示缺少 `class`，这通常和增量编译、缓存或 IDE 构建状态有关。

### 常规编译

```bash
mvn -pl deepctrls-server -am -DskipTests compile
```

### 遇到疑难编译问题时

```bash
mvn -pl deepctrls-server -am "-Dmaven.compiler.useIncrementalCompilation=false" -DskipTests clean compile
```


