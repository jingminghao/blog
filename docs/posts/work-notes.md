# 工作随记

> 这篇文章从工作随记中提炼而来，只保留适合公开沉淀的通用经验；账号、口令、内网地址、密钥等敏感内容已全部剔除。

## 1. Spring Boot 启动钩子怎么选

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

```bash
java -jar app.jar --spring.config.location=/path/to/application.yml
```

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


