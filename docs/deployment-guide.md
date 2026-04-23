# aifix_hs 部署指南

> 面向运维人员的生产环境部署手册。涵盖系统要求、安装步骤、密钥生成、定时任务、上线检查清单与常见问题。

---

## 目录

1. [系统要求](#1-系统要求)
2. [部署前准备](#2-部署前准备)
3. [安装步骤](#3-安装步骤)
4. [环境变量配置](#4-环境变量配置)
5. [密钥与证书生成](#5-密钥与证书生成)
6. [Web 服务器配置](#6-web-服务器配置)
7. [定时任务与队列](#7-定时任务与队列)
8. [OSS 文件存储配置](#8-oss-文件存储配置)
9. [HTTPS 与安全加固](#9-https-与安全加固)
10. [监控与日志](#10-监控与日志)
11. [上线检查清单](#11-上线检查清单)
12. [常见问题](#12-常见问题)
13. [升级与回滚](#13-升级与回滚)

---

## 1. 系统要求

### 1.1 服务器最小配置

| 用途 | CPU | 内存 | 磁盘 | 备注 |
|---|---|---|---|---|
| 单企业 / 小型集团（≤ 10 子公司） | 2 核 | 4 GB | 40 GB SSD | 同一台机器跑应用 + DB |
| 中型集团（10–50 子公司） | 4 核 | 8 GB | 80 GB SSD | 建议应用与 DB 分离 |
| 大型集团（50+ 子公司） | 8 核 | 16 GB | 200 GB SSD | DB 独立 + Redis 缓存 |

### 1.2 软件依赖

| 组件 | 版本 | 说明 |
|---|---|---|
| **PHP** | 8.3 或 8.4 | 必须包含 OpenSSL、Mbstring、PDO、Tokenizer、XML、Ctype、JSON、BCMath、Curl、Fileinfo、GD（PhpWord 导出 docx 需要）、Zip 扩展 |
| **MySQL** | 8.0+ | 推荐；也支持 PostgreSQL 14+ / MariaDB 10.11+ |
| **Node.js** | 20+ | 仅构建阶段需要，生产服务器可不装 |
| **npm** | 10+ | 构建前端资产 |
| **Composer** | 2.7+ | PHP 依赖管理 |
| **Web 服务器** | Nginx 1.22+ / Apache 2.4+ | Nginx 推荐 |
| **Redis** | 7+ | 可选，用于队列 / 缓存 / Session（性能更好） |
| **Supervisor** | 4.x | 可选，用于队列 worker 自动重启 |

### 1.3 推荐系统

- **OS**: Ubuntu 24.04 LTS / Debian 12 / Alma Linux 9
- **PHP-FPM** 启用，进程池大小按 `(CPU 核数) × 2`

---

## 2. 部署前准备

### 2.1 在跳板机上克隆代码

```bash
git clone https://github.com/univlake/aifix_hs.git
cd aifix_hs
git checkout main   # 或者你的发布分支
```

### 2.2 提前准备的资源

- [ ] 一个域名（建议子域名如 `safety.example.com`），DNS A 记录指向服务器公网 IP
- [ ] HTTPS 证书（Let's Encrypt 或商业证书）
- [ ] MySQL 数据库 + 一个独立的应用账号
- [ ] 阿里云 OSS Bucket（用于附件存储）+ AccessKey
- [ ] 服务器 SSH 访问 + sudo 权限

### 2.3 防火墙开放端口

| 端口 | 用途 |
|---|---|
| 80 | HTTP（用于 Let's Encrypt 证书续签 + 重定向到 HTTPS）|
| 443 | HTTPS |
| 3306 | MySQL（仅在 DB 在另一台机器时） |
| 22 | SSH（建议改成非默认端口） |

---

## 3. 安装步骤

### 3.1 安装 PHP 依赖

```bash
# 在生产服务器
cd /var/www/aifix_hs   # 你的部署目录
composer install --no-dev --optimize-autoloader --no-interaction
```

`--no-dev` 跳过 Pest / Pint 等开发依赖。`--optimize-autoloader` 生成 PSR-4 类映射，启动更快。

### 3.2 安装与构建前端

如果有 Node 环境，可在服务器上构建：

```bash
npm ci                    # 严格按 package-lock.json 安装
npm run build             # 输出到 public/build/
```

如果生产服务器没有 Node 环境（推荐做法），在 CI 或本地构建后将 `public/build/` 目录传到服务器：

```bash
# 本地
npm run build
rsync -av --delete public/build/ deploy@server:/var/www/aifix_hs/public/build/
```

### 3.3 复制并编辑环境变量

```bash
cp .env.example .env
vim .env   # 详见 §4
```

### 3.4 生成应用密钥

```bash
php artisan key:generate
```

### 3.5 数据库初始化

```bash
php artisan migrate --force
php artisan db:seed --class=RolesAndPermissionsSeeder --force
php artisan db:seed --class=BaseDataSeeder --force        # 基础字典
php artisan db:seed --class=RegulationLibraryTypeSeeder --force
```

`--force` 在生产环境绕过交互提示。**确保 `.env` 的 `APP_ENV=production` 之前先做完种子**，否则 `db:seed` 会拒绝运行。

### 3.6 生成 Passport 密钥

```bash
php artisan passport:keys --force
php artisan passport:client --personal --no-interaction --name="Web"
```

第一条命令在 `storage/` 下生成 `oauth-private.key` + `oauth-public.key`。第二条创建 Personal Access Client 用于发放用户 token。

### 3.7 生成 RSA 密钥对（密码加密用）

详见 §5.1。

### 3.8 优化 Laravel 缓存

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache
```

每次部署新版本后都要重新执行这 4 条。

### 3.9 设置存储目录权限

```bash
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache
```

`www-data` 是 Nginx/Apache 默认运行账户；如使用 PHP-FPM 池子的其他账户请相应替换。

### 3.10 创建符号链接

```bash
php artisan storage:link
```

将 `storage/app/public` 链接到 `public/storage`，使上传文件可通过 URL 访问。

---

## 4. 环境变量配置

`.env` 是部署核心。以下按重要性分组列出。

### 4.1 应用基础

```ini
APP_NAME="aifix_hs"
APP_ENV=production
APP_KEY=                            # php artisan key:generate 生成
APP_DEBUG=false                     # 生产环境必须为 false
APP_URL=https://safety.example.com  # 必须与外部访问域名一致
APP_LOCALE=zh_CN
APP_FALLBACK_LOCALE=en
```

⚠️ `APP_DEBUG=true` 会暴露堆栈、环境变量、数据库密码等敏感信息。**生产环境必须为 false**。

### 4.2 数据库

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=aifix_hs
DB_USERNAME=aifix_hs
DB_PASSWORD=replace-with-strong-password
DB_CHARSET=utf8mb4
DB_COLLATION=utf8mb4_unicode_ci
```

**MySQL 用户最小权限**（不要用 root）：

```sql
CREATE DATABASE aifix_hs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'aifix_hs'@'localhost' IDENTIFIED BY 'replace-with-strong-password';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, INDEX, DROP, REFERENCES
  ON aifix_hs.* TO 'aifix_hs'@'localhost';
FLUSH PRIVILEGES;
```

### 4.3 缓存 / Session / 队列

```ini
# 推荐 Redis
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

REDIS_CLIENT=phpredis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=null

# 没有 Redis 时降级到数据库
# CACHE_STORE=database
# SESSION_DRIVER=database
# QUEUE_CONNECTION=database
```

### 4.4 RSA 密钥（密码加密）

```ini
RSA_PRIVATE_KEY=base64-encoded-2048-bit-private-key
RSA_PUBLIC_KEY=base64-encoded-2048-bit-public-key
```

参见 §5.1 的生成方法。这两个值是 base64 编码的单行字符串。

### 4.5 OSS 阿里云对象存储

```ini
OSS_ACCESS_KEY_ID=LTAI5tXXXXXXXXXX
OSS_ACCESS_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXX
OSS_BUCKET=aifix-hs-prod
OSS_ENDPOINT=oss-cn-hangzhou.aliyuncs.com
OSS_URL=https://aifix-hs-prod.oss-cn-hangzhou.aliyuncs.com
OSS_CALLBACK_URL=https://safety.example.com/api/v1/upload/oss-callback
```

### 4.6 日志

```ini
LOG_CHANNEL=daily               # 按天切割
LOG_LEVEL=warning               # 生产环境
LOG_DEPRECATIONS_CHANNEL=null
```

### 4.7 邮件（可选，用于密码重置等）

```ini
MAIL_MAILER=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=587
MAIL_USERNAME=safety@example.com
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="safety@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### 4.8 Vite

```ini
VITE_APP_NAME="${APP_NAME}"
```

---

## 5. 密钥与证书生成

### 5.1 RSA 2048-bit 密钥对（用于浏览器密码加密）

在任何安装了 OpenSSL 的机器上：

```bash
# 1. 生成私钥
openssl genrsa -out private.pem 2048

# 2. 导出公钥
openssl rsa -in private.pem -pubout -out public.pem

# 3. 转 base64 单行（用于 .env）
echo "RSA_PRIVATE_KEY=$(base64 -w 0 private.pem)" >> rsa.env
echo "RSA_PUBLIC_KEY=$(base64 -w 0 public.pem)" >> rsa.env

# 4. 把 rsa.env 的两行复制到正式 .env
cat rsa.env

# 5. 安全清理
shred -u private.pem public.pem rsa.env
```

⚠️ 私钥泄漏 = 所有密码可以被解密。生成后 .env 文件权限应为 `600`，且不要提交到 git。

### 5.2 Passport OAuth2 密钥

```bash
php artisan passport:keys --force
```

输出文件：
- `storage/oauth-private.key`（保密）
- `storage/oauth-public.key`

如有多台应用服务器，**这两个文件必须在所有节点上保持一致**——可以选定一台生成后用 rsync / Ansible 分发。

或者放进 .env 而非文件（避免分发）：

```ini
PASSPORT_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
PASSPORT_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----"
```

注意需要把换行符转为 `\n` 字面量（详见 [Passport 文档](https://laravel.com/docs/12.x/passport#client-secret-hashing)）。

### 5.3 HTTPS 证书

Let's Encrypt（免费 + 自动续期）：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d safety.example.com
```

商业证书：购买后将 `.crt` + `.key` 放在 `/etc/nginx/ssl/`，在 Nginx 配置中引用。

---

## 6. Web 服务器配置

### 6.1 Nginx（推荐）

`/etc/nginx/sites-available/aifix_hs.conf`：

```nginx
server {
    listen 80;
    server_name safety.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name safety.example.com;

    ssl_certificate     /etc/letsencrypt/live/safety.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/safety.example.com/privkey.pem;
    ssl_protocols       TLSv1.2 TLSv1.3;
    ssl_ciphers         HIGH:!aNULL:!MD5;

    root /var/www/aifix_hs/public;
    index index.php;

    client_max_body_size 50M;          # 附件上传上限，按需调大

    # 安全响应头
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 静态资源直接返回
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff2?)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # 拒绝隐藏文件
    location ~ /\.(?!well-known) {
        deny all;
    }

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param DOCUMENT_ROOT $realpath_root;
        fastcgi_read_timeout 300;
    }

    error_log  /var/log/nginx/aifix_hs_error.log warn;
    access_log /var/log/nginx/aifix_hs_access.log;
}
```

启用：
```bash
sudo ln -s /etc/nginx/sites-available/aifix_hs.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 6.2 PHP-FPM 调优

`/etc/php/8.4/fpm/pool.d/www.conf`：

```ini
pm = dynamic
pm.max_children = 32           # 内存允许范围内：(可用内存 / 单 worker 内存)
pm.start_servers = 8
pm.min_spare_servers = 4
pm.max_spare_servers = 16
pm.max_requests = 500          # 防止内存泄漏

request_terminate_timeout = 300s
```

### 6.3 上传大小

如果出现「413 Request Entity Too Large」：

- Nginx：`client_max_body_size 50M;`（已在示例中）
- `php.ini`：`upload_max_filesize = 50M` + `post_max_size = 60M`
- 重启 PHP-FPM 与 Nginx

---

## 7. 定时任务与队列

### 7.1 注册 Laravel 调度器到 cron

```bash
sudo crontab -e -u www-data
```

添加一行：

```cron
* * * * * cd /var/www/aifix_hs && php artisan schedule:run >> /dev/null 2>&1
```

这会调用 `routes/console.php` 中所有定时任务，目前包括：

| 命令 | 频率 | 说明 |
|---|---|---|
| `risk:calculate --content='每日定时计算'` | 每日 02:00 | 重算所有生产企业的风险值；详见用户手册 §7 |

### 7.2 队列 worker（如配置了 `QUEUE_CONNECTION=redis` 或 `database`）

使用 Supervisor 守护：

`/etc/supervisor/conf.d/aifix_hs-queue.conf`：

```ini
[program:aifix_hs-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/aifix_hs/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/log/supervisor/aifix_hs-queue.log
stopwaitsecs=3600
```

启动：
```bash
sudo supervisorctl reread
sudo supervisorctl update
sudo supervisorctl start aifix_hs-queue:*
```

⚠️ 当前项目尚未提交大量 queueable jobs（活动日志会写但用同步执行）。先配置定时任务即可，队列 worker 等业务确实要用到时再加。

### 7.3 验证调度器

```bash
sudo -u www-data php artisan schedule:list
sudo -u www-data php artisan schedule:run --verbose   # 立即执行一次
```

手动测试定时任务：
```bash
sudo -u www-data php artisan risk:calculate --content='manual-test'
```

---

## 8. OSS 文件存储配置

### 8.1 创建 OSS Bucket

阿里云控制台 → OSS → 创建 Bucket。要点：

- **存储类型**：标准存储
- **读写权限**：私有
- **跨域配置（CORS）**：必须配置，否则浏览器直传会被拦截

CORS 规则：

```yaml
来源(AllowedOrigin):
  - https://safety.example.com
允许 Methods:
  - GET
  - POST
  - PUT
允许 Headers:
  - "*"
暴露 Headers:
  - ETag
  - x-oss-request-id
缓存时间:
  - 600
```

### 8.2 创建 RAM 子账号

不要用主账号 AccessKey。在 RAM 控制台创建子账号，授予最小权限：

- `AliyunOSSReadOnlyAccess` + 写入策略限定到 `aifix_hs-prod` Bucket

### 8.3 后端只签发，不传输

我们的实现：浏览器请求 `/api/v1/upload/oss-signature` → 后端用 RAM 子账号生成预签名 → 浏览器直接 PUT 到 OSS。文件二进制流不经过应用服务器，节省带宽。

### 8.4 验证

```bash
# 上传一个 1KB 测试文件，看 .env 是否配对
curl -X POST https://safety.example.com/api/v1/upload/oss-signature \
  -H "Authorization: Bearer ${TEST_TOKEN}" \
  | jq
```

返回应包含 `host`、`policy`、`signature` 字段。

---

## 9. HTTPS 与安全加固

### 9.1 必做

- [x] 全站 HTTPS（§5.3）
- [x] HSTS 头（已在 Nginx 示例中）
- [x] `APP_DEBUG=false`
- [x] `APP_ENV=production`
- [x] DB 用户最小权限（§4.2）
- [x] OSS 用 RAM 子账号
- [x] `.env` 文件权限 600 + 不提交 git
- [x] `storage/oauth-*.key` 文件权限 600

### 9.2 推荐

- 限制 SSH 仅密钥登录、改非默认端口、禁用 root 远程登录
- 安装 fail2ban
- 数据库定期备份（详见 §10.3）
- 应用日志接入 Sentry / Datadog 等错误监控
- 启用 Nginx rate limiting（防暴力破解登录）：

```nginx
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;

location = /api/v1/login {
    limit_req zone=login burst=3 nodelay;
    try_files $uri /index.php?$query_string;
}
```

### 9.3 可选

- Cloudflare 或阿里云 WAF 在前端
- 数据库 TLS 连接（`DB_ENCRYPT=true`）
- 应用层只读副本切换（如读写分离）

---

## 10. 监控与日志

### 10.1 Laravel 日志

`.env`：`LOG_CHANNEL=daily`、`LOG_LEVEL=warning`。日志位置：`storage/logs/laravel-YYYY-MM-DD.log`。

### 10.2 实时跟踪

```bash
# Laravel 日志
sudo -u www-data php artisan pail   # 颜色化实时日志（已安装 pail）

# Nginx
tail -f /var/log/nginx/aifix_hs_error.log

# PHP-FPM
tail -f /var/log/php8.4-fpm.log
```

### 10.3 备份

**数据库**（每日）：

```bash
#!/bin/bash
# /usr/local/bin/aifix_hs-backup.sh
DATE=$(date +%F)
mysqldump --single-transaction --quick --lock-tables=false \
  -u aifix_hs -p"${DB_PASSWORD}" aifix_hs \
  | gzip > /var/backups/aifix_hs/db-${DATE}.sql.gz
find /var/backups/aifix_hs -name "db-*.sql.gz" -mtime +30 -delete
```

cron：
```cron
0 3 * * * /usr/local/bin/aifix_hs-backup.sh
```

**附件**：OSS 自带版本控制，可在 Bucket 配置中开启。或定期同步到另一个 region 的 Bucket。

### 10.4 关键监控指标

| 指标 | 告警阈值 |
|---|---|
| `risk:calculate` 是否每日 02:00–02:10 之间执行成功 | 1 天未执行报警 |
| HTTP 5xx 比例 | > 0.5% / 5min |
| PHP-FPM 进程数 | > 80% pm.max_children |
| MySQL 慢查询 | > 10/min |
| 磁盘使用率 | > 80% |
| Bucket 访问异常 | OSS 控制台告警 |

---

## 11. 上线检查清单

✅ 部署前最后过一遍：

```
应用配置
  [ ] APP_DEBUG=false
  [ ] APP_ENV=production
  [ ] APP_KEY 已生成（不为空）
  [ ] APP_URL 与外部域名一致
  [ ] .env 文件权限 600

数据库
  [ ] migrate 全部执行成功（php artisan migrate:status）
  [ ] 三个 seeder 均执行：RolesAndPermissionsSeeder + BaseDataSeeder + RegulationLibraryTypeSeeder
  [ ] 至少创建一个 super-admin 账号
  [ ] 数据库账号是最小权限

密钥
  [ ] RSA_PRIVATE_KEY / RSA_PUBLIC_KEY 已配置
  [ ] storage/oauth-private.key + oauth-public.key 已生成
  [ ] passport:client --personal 已运行（创建 Personal Access Client）

文件 / 权限
  [ ] storage/ + bootstrap/cache/ 属于 www-data 且 775
  [ ] php artisan storage:link 已执行
  [ ] public/build/ 包含构建产物

定时任务
  [ ] cron 已添加 schedule:run 行
  [ ] schedule:list 显示 risk:calculate

HTTPS
  [ ] 证书有效，自动续期已配置
  [ ] HTTPS 重定向正常（80 → 443）
  [ ] HSTS 头已发送

OSS
  [ ] Bucket 已创建 + CORS 配置正确
  [ ] RAM 子账号 AccessKey 已配置到 .env
  [ ] curl 测试 /upload/oss-signature 返回 200

性能优化
  [ ] config:cache、route:cache、view:cache、event:cache 已执行
  [ ] composer install --no-dev --optimize-autoloader

冒烟测试
  [ ] /login 页面返回 200
  [ ] 用 super-admin 登录成功
  [ ] 创建一个测试企业 → 测试用户 → 登录该用户能看到正确菜单
  [ ] 上传一张图片到任意有附件字段的页面，验证 OSS 链接可访问
  [ ] 手动 php artisan risk:calculate --content='deploy-test' 成功
  [ ] /dashboard 加载无 5xx
  [ ] 浏览器开发者工具 Network 面板确认 .js / .css 来自 public/build/

监控
  [ ] 错误监控（Sentry / Bugsnag / 内部）已接入
  [ ] 数据库备份脚本已配置 cron
  [ ] OSS 备份策略已确认
```

---

## 12. 常见问题

### Q1. 部署后 500 错误，看不到详情？
**原因：** 生产环境 `APP_DEBUG=false`，详细堆栈不会返回到浏览器。
**解决：** 查看 `storage/logs/laravel-YYYY-MM-DD.log`。如果该文件没生成，检查 `storage/` 权限是否为 `www-data:www-data 775`。

### Q2. 上传文件失败，OSS 返回 403？
**原因：** 多半是 CORS 没配置或 RAM 子账号权限不足。
**解决：**
1. OSS 控制台 → Bucket → 跨域配置，确认 `AllowedOrigin` 包含 `https://safety.example.com`
2. RAM 子账号策略中是否有 `oss:PutObject` 对该 Bucket 的权限

### Q3. 登录提示「密码错误」但密码正确？
**原因：** RSA 公钥/私钥不匹配，或 base64 编码出错。
**解决：**
1. 检查 `.env` 中 `RSA_PRIVATE_KEY` / `RSA_PUBLIC_KEY` 是否为同一对密钥
2. base64 解码后应得到 `-----BEGIN RSA PRIVATE KEY-----` 开头的 PEM 文本
3. 使用 §5.1 重新生成一对，更新 `.env`，`php artisan config:cache`

### Q4. 升级代码后样式丢失？
**原因：** 浏览器缓存了旧的 `app.css`，但 manifest 已变。
**解决：**
- 确保部署脚本最后执行 `php artisan config:cache`（重新读取 manifest）
- Nginx 配置 `Cache-Control: immutable` 但实际上文件名带 hash，刷新页面即可
- 用户端可硬刷新（Ctrl + Shift + R）

### Q5. `risk:calculate` 没有按时执行？
**排查：**
```bash
# 1. cron 是否在跑
sudo grep CRON /var/log/syslog | tail
# 2. www-data 用户的 cron 是否包含 schedule:run
sudo crontab -l -u www-data
# 3. schedule:list 是否列出该任务
sudo -u www-data php artisan schedule:list
# 4. 查最近一次执行
sudo -u www-data php artisan schedule:run --verbose
```

### Q6. 部署在多台应用服务器，session/queue 不共享？
**原因：** `SESSION_DRIVER=file` 是默认值，文件只存在于当前节点。
**解决：** 改用 `SESSION_DRIVER=redis` 或 `database`；同样适用 `CACHE_STORE` / `QUEUE_CONNECTION`。

### Q7. 内存占用持续上升？
**排查：**
- PHP-FPM `pm.max_requests = 500` 限制每个 worker 最多服务 500 次后重启，避免内存泄漏
- 如果是定时任务（如 `risk:calculate`）占用，单次执行结束 PHP 进程会自动释放
- 长时间运行的 queue worker 加 `--max-time=3600`

### Q8. 怎样新建一个 super-admin？
```bash
php artisan tinker
```
```php
$user = App\Models\User::create([
    'username' => 'superadmin',
    'password' => bcrypt('replace-with-strong-password'),
    'nickname' => '超级管理员',
    'company_id' => 1,   // 第一个企业的 id
    'status' => 1,
]);
$user->assignRole('super-admin');
```

或者写入 `RolesAndPermissionsSeeder` 之后的种子文件，下次 `db:seed` 时执行。

---

## 13. 升级与回滚

### 13.1 标准升级流程

```bash
# 0. 备份
mysqldump aifix_hs > /tmp/pre-upgrade-$(date +%F).sql

# 1. 拉取新代码
cd /var/www/aifix_hs
git fetch origin
git checkout v1.X.Y     # 用 tag

# 2. 进入维护模式
php artisan down --secret="some-secret-token"
# 维护模式下，运维仍可访问 https://safety.example.com/some-secret-token

# 3. 安装依赖
composer install --no-dev --optimize-autoloader --no-interaction

# 4. 同步前端构建产物（在 CI / 本地构建后传过来）
rsync -av --delete /local/build/ /var/www/aifix_hs/public/build/

# 5. 数据库迁移
php artisan migrate --force

# 6. 清理 + 重新缓存
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 7. 重启 PHP-FPM（清掉 OPcache 旧代码）
sudo systemctl reload php8.4-fpm

# 8. 重启队列 worker（如有）
sudo supervisorctl restart aifix_hs-queue:*

# 9. 退出维护模式
php artisan up

# 10. 冒烟测试
curl -I https://safety.example.com   # 期望 200
```

### 13.2 回滚

如果新版本出问题：

```bash
php artisan down

# 1. 切回上一个 tag
git checkout v1.X.Y-previous

# 2. 反向迁移（如果新版本有破坏性 schema 变更）
php artisan migrate:rollback --step=N --force
# 或者从备份恢复
mysql aifix_hs < /tmp/pre-upgrade-2026-04-22.sql

# 3. 同步旧的 public/build/
# （需要保留每次部署的 build 产物）

# 4. 清缓存 + 重启 PHP-FPM
php artisan optimize:clear
php artisan config:cache && php artisan route:cache
sudo systemctl reload php8.4-fpm

php artisan up
```

⚠️ **可逆性原则**：每个 schema 迁移都应实现 `down()` 方法，否则只能从备份恢复。本项目目前的迁移大多有 `down()`，但部分破坏性变更（如 `drop_risk_max_values_table`）回滚后旧数据已丢失，需从备份恢复。

### 13.3 零停机部署（高级）

如果业务不能容忍 5–10 秒的维护时间：

1. 准备 2 套部署目录（`releases/v1.0.0` + `releases/v1.0.1`）
2. 通过符号链接切换 `/var/www/aifix_hs/current` 指向新版本
3. PHP-FPM `reload` 而非 `restart`
4. 配合数据库**前向兼容**的 schema 变更（先加列，部署应用，再删旧列）

---

> 文档版本：2026-04-22。如部署中遇到本手册未覆盖的问题，请将日志 + 操作步骤反馈给开发团队。
