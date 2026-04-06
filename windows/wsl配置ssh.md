# 从零配置 WSL2 Ubuntu 启用远程 SSH 访问

## 准备工作

1. 确保已启用 WSL2 并从 Microsoft Store 安装 Ubuntu
2. 首次启动 Ubuntu，完成初始用户和密码设置
3. 后续操作涉及 **Ubuntu 终端** 和 **Windows PowerShell**，建议同时打开两者

## 在 WSL2 Ubuntu 中配置 SSH 服务

### 1. 更新软件包列表

```bash
sudo apt update
```

### 2. 清理并重装 OpenSSH Server

```bash
sudo apt remove --purge -y openssh-server
sudo apt install -y openssh-server
```

### 3. 修改 SSH 配置文件

```bash
sudo vim /etc/ssh/sshd_config
```

**关键配置项**（修改或取消注释）：

```ssh-config
Port 2222                      # 避免与 Windows 可能的 SSH 服务冲突
ListenAddress 0.0.0.0          # 允许所有网络接口连接
PasswordAuthentication yes     # 启用密码登录（也可配合密钥认证）
PermitRootLogin no             # 禁用 root 登录（安全建议）
```

### 4. 创建运行目录并启动 SSH 服务

WSL2 启动时可能缺少 `/run/sshd`，需手动创建：

```bash
sudo mkdir -p /run/sshd
sudo chmod 755 /run/sshd
sudo /usr/sbin/sshd
```

::: tip 验证是否监听 2222 端口

```bash
sudo ss -tulnp | grep ':2222'
```

![验证是否监听2222端口](/windows/wsl配置ssh/验证是否监听2222端口.png)

:::

## 在 Windows 主机上配置端口转发与防火墙

### 1. 获取 WSL2 的当前 IP 地址

::: tip 在 **Ubuntu 终端中执行**：

```bash
ip addr
```

![获取wsl的IP地址](/windows/wsl配置ssh/获取wsl的IP地址.png)

:::

### 2. 添加端口转发规则

在 **PowerShell** 中执行（将 Windows 主机的 2222 端口转发到 WSL2）：

```powershell
# 设置端口转发
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=2222 connectaddress=172.23.22.69 connectport=2222

# 删除端口转发
netsh interface portproxy delete v4tov4 listenport=2222 listenaddress=0.0.0.0
```

::: tip 验证转发规则是否生效

```powershell
netsh interface portproxy show all
```

![显示当前系统中所有配置的端口代理](/windows/wsl配置ssh/显示当前系统中所有配置的端口代理.png)

:::

### 3. 添加 Windows 防火墙入站规则

允许外部设备访问 Windows 的 2222 端口：

```powershell
netsh advfirewall firewall add rule name="WSL2 远程SSH端口" dir=in action=allow protocol=TCP localport=2222
```

::: info 连接方式

配置完成后，局域网内其他设备可通过以下命令连接：

```bash
ssh your_wsl_username@<Windows主机IP> -p 2222
```

:::

### 4. 配置密钥登录（可选，推荐）

1. 生成密钥：

```bash
ssh-keygen -t rsa
```

2. 将公钥复制到服务器：

```bash
ssh-copy-id -p 222 administrator@192.168.14.70
```

::: warning Windows 下通常没有 `ssh-copy-id`

可手动复制 `~/.ssh/id_rsa.pub` 内容到服务器 `~/.ssh/authorized_keys`

:::

## 附录：常见问题

### SSH 主机密钥变更警告

若连接时提示 `WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!`，说明 WSL2 IP 或主机密钥已变。清除旧记录：

```bash
ssh-keygen -R "[<Windows_IP>]:2222"
```

### 端口转发不生效时的排查

在 PowerShell 执行以下步骤：

**1. 检查系统端口排除范围**

```powershell
netsh int ipv4 show excludedportrange protocol=tcp
```

**2. 使用冷门端口验证 portproxy 转发链路**

```powershell
netsh interface portproxy add v4tov4 listenport=54321 listenaddress=0.0.0.0 connectport=2222 connectaddress=172.25.225.155
netstat -ano | findstr :54321
```

**3. 重启并用调试模式启动 sshd**

```bash
 # 杀死 ssh 进程
sudo pkill sshd

# 创建 sshd 运行时目录（存放 PID 等），并设置权限供 sshd 使用
# wsl 通常需要
sudo mkdir -p /run/sshd
sudo chmod 755 /run/sshd

# 启动调试模式
sudo /usr/sbin/sshd -ddd -p 222
```
