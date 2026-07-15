# docker

> 配置、应用、部署相关的经验总结。

## 安装 | 配置

- 清理
```bash
-- 清理 Docker Build 缓存 ( docker build -t myapp .  Docker 会缓存)
docker builder prune -a -f

-- 清理 没被容器使用的镜像
docker image prune -a -f

-- 会删除停止的容器、无用的镜像
docker system prune -a -f

```

- 更换属性
```bash
docker update --restart=always 容器名
```

---

## 1.mysql

- mysql5.7
```bash
mkdir -p  /usr/local/docker_container/mysql/{conf.d,data,logs}

```

- 创建配置文件
```bash
cat > /usr/local/docker_container/mysql/conf.d/my.cnf << EOF 
[mysqld] 
# 字符集 
character-set-server=utf8mb4 
collation-server=utf8mb4_general_ci 

# 时区 
default-time-zone='+08:00' 

# 表名忽略大小写 
lower_case_table_names=1 

# 最大连接数 
max_connections=500 

# 日志 
slow_query_log=1 
long_query_time=2 

[client] 
default-character-set=utf8mb4 

[mysql] 
default-character-set=utf8mb4 
EOF
```

- 设置权限、启动
> 注意： 不要使用 777 否则 MySQL 会提示：World-writable config file '/etc/mysql/conf.d/my.cnf' is ignored
```bash
chmod 755 /usr/local/docker_container/mysql 
chmod 755 /usr/local/docker_container/mysql/data 
chmod 755 /usr/local/docker_container/mysql/conf.d 
chmod 644 /usr/local/docker_container/mysql/conf.d/my.cnf

docker run -d --name mysql \
--restart=always \
-p 3306:3306 \
-e MYSQL_ROOT_PASSWORD=123456 \
-e TZ=Asia/Shanghai \
-v /etc/localtime:/etc/localtime:ro \
-v /etc/timezone:/etc/timezone:ro \
-v /usr/local/docker_container/mysql/data:/var/lib/mysql \
-v /usr/local/docker_container/mysql/conf.d:/etc/mysql/conf.d \
mysql:5.7
```

> 查看日志
> 
> docker logs -tf mysql

- 连接mysql
```bash
docker exec -it mysql mysql -uroot -p
输入密码：123456
```






