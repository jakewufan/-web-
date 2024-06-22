<center>
    <font size=7 >数据大屏
</center>

[TOC]



# 配置环境

首先需要安装centos虚拟机，并准备多台虚拟机，一台当作管理机来使用，其他作为被管理机，以下操作全在管理机上执行。

##  安装ansible

1. ansible的安装命令（需要执行两次）

~~~~
yum install -y epel-release ansible libselinux-python
~~~~

2. 链接主机

进入/etc/ansible/hosts  添加命令

~~~~
[主机组名]
xxx.xxx.xxx.xxx
xxx.xxx.xxx.xxx
~~~~

3. 采用公钥 免密登录

1.链接主机  （发现需要登陆密码）

2.主机上生成密钥

生成密钥

~~~~
ssh-keygen
~~~~

3.设置免密登录（使用公钥）

复制ssh密钥到远程主机，这样shh的时候不用输入密码了

```
ssh-copy-id root@ip
```

## 安装web服务器和PHP

安装命令

~~~~
sudo yum update -y  
sudo yum install -y httpd php php-cli php-gd php-mbstring php-mysqlnd
~~~~

安装完成后，启动Apache服务并设置其开机自启：

~~~~
sudo systemctl start httpd  
sudo systemctl enable httpd
~~~~

设置防火墙

~~~~
systemctl stop firewalld
~~~~

安装vim编辑器

```
yum install vim -y
```

# 前期准备

### 检测是否成功连接主机

显示pong则为链接成功

```
ansible all -m ping
```

### 测试是否能够访问到界面

把本项目的所有文件放在/var/www/html文件夹中

```
sudo chmod +x /var/www/html/get_system_info.php
sudo chmod +x /var/www/html/index.php
sudo chmod +x elete_json_files.sh
```

### 运行shell脚本

```
./elete_json_files.sh
```

# 文件说明

**代码总结构**

![image-20240622162629599](.\image-20240622162629599.png)

## playbook文件

**代码说明**

这个Ansible playbook（Playbook.yml）的目的是收集主机（在这里被称为web）的系统信息，并将这些信息保存到JSON文件中。

每个任务的作用：

1. **Check if machine is running**:
   - 使用 `uptime` 命令检查主机是否运行。
   - 将结果保存在 `uptime_result` 变量中，并使用 `ignore_errors: yes` 来忽略错误。
2. **Get network interfaces**:
   - 使用 `ip` 命令获取所有网络接口（除了 loopback 接口）。
   - 将结果保存在 `network_interfaces` 变量中。
3. **Set network interface fact**:
   - 设置事实 `network_interface`，使用第一个非 loopback 网络接口。
4. **Get CPU usage**:
   - 使用 `top` 命令获取 CPU 使用率。
   - 将结果保存在 `cpu_usage` 变量中。
5. **Get memory usage**:
   - 使用 `free` 命令获取内存使用率。
   - 将结果保存在 `memory_usage` 变量中。
6. **Get disk usage**:
   - 使用 `df` 命令获取磁盘使用率。
   - 将结果保存在 `disk_usage` 变量中。
7. **Get network traffic**:
   - 使用 `cat /proc/net/dev` 命令获取特定网络接口（之前获取的第一个非 loopback 接口）的接收和传输流量信息。
   - 将结果保存在 `network_traffic` 变量中。
8. **Get system load**:
   - 使用 `uptime` 命令获取系统负载信息。
   - 将结果保存在 `system_load` 变量中。
9. **Check if host is online**:
   - 使用 `ping` 命令检查主机是否在线。
   - 将结果保存在 `ping_result` 变量中。
10. **Set online status fact**:
    - 根据 `ping_result` 的返回码（rc），设置主机的在线状态为 "Online" 或 "Offline"。
    - 使用 `set_fact` 设置事实 `online_status`。
11. **Ensure JSON directory exists**:
    - 在本地主机上，确保目录 `/var/www/html` 存在，以便存储JSON文件。
    - 使用 `file` 模块操作文件系统。
12. **Save results to local file based on online status**:
    - 在本地主机上，将收集到的系统信息保存到JSON文件中。
    - 使用 `copy` 模块将JSON格式的内容写入到 `/var/www/html/status_{{ inventory_hostname }}.json` 文件中，其中包含了主机名、运行时间、CPU使用率、内存使用率、磁盘使用率、网络流量、系统负载和在线状态。

playbook的设计思路是收集关键的系统指标信息，并将其存储在易于访问的JSON文件中，以便后续的监控和分析。同时，它确保了目标目录的存在并处理了可能的错误情况，比如主机的在线状态和命令执行的异常。

## php页面

### get_system_info.php

**具体功能**:

1. **文件扫描**: 使用 `glob('/var/www/html/status_*.json')` 扫描目录下所有符合特定模式（`status_*.json`）的JSON文件。
2. **数据解析**: 对每个找到的JSON文件进行读取和解析，提取主机名、运行时间、CPU使用率、内存使用情况、磁盘使用情况、网络流量、系统负载和在线状态等信息。
3. **HTML生成**: 构建一个HTML表格，将解析的信息按照列的方式展示出来。每行对应一个主机的信息，包括了操作按钮（关机按钮）。
4. **数据准备**: 为前端页面更新饼图提供所需的CPU使用率、内存使用情况数据和主机名标签。
5. **JSON响应**: 将生成的HTML表格和相关数据以JSON格式返回给前端页面，用于动态更新和显示系统状态信息。

**执行流程**:

- 当有HTTP请求到达时，PHP脚本首先扫描指定目录下的JSON文件。
- 对每个JSON文件进行读取和解析，构建一个包含系统信息的HTML表格，并生成CPU使用率、内存使用情况数据和主机名标签用于更新饼图。
- 最终，将生成的HTML表格和数据以JSON格式返回给发起请求的前端页面，供前端JavaScript代码使用Ajax动态更新页面内容。

### index.php

**代码说明**

这段HTML代码是一个简单的系统信息展示页面，使用了Ajax动态加载系统信息并使用Chart.js库绘制了CPU使用率和内存使用情况的饼图。

![image-20240622162438656](.\image-20240622162438656.png)

**这里需要修改为管理机的IP地址**

**HTML 结构部分**

1. **Head 部分**
   - `<title>系统信息</title>`: 设置页面标题为 "系统信息"。
   - 引入了一些CSS样式和JavaScript库：
     - CSS样式用于页面布局和美化。
     - `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>`: 引入Chart.js库，用于绘制图表。
     - `<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>`: 引入jQuery库，用于简化Ajax操作。
     - `<script src="http://192.168.134.137/s-info.js"></script>`: 引入了一个可能用于处理系统信息更新的JavaScript文件。（部署时需要改为自己虚拟机的IP地址）

2. **Body 部分**
   - `<div class="container">`: 主要的内容容器，包含了系统信息的标题、表格和图表。
   - `<div id="system-info">`: 这个div将通过Ajax动态更新系统信息表格内容。

**JavaScript 部分**

1. **$(document).ready(function() { ... });**
   - 当页面加载完成时执行的函数。
   - `updateSystemInfo();`: 页面加载时调用 `updateSystemInfo()` 函数，用于加载系统信息。

2. **updateSystemInfo() 函数**
   - 使用Ajax向服务器端发起请求，获取系统信息。
   - 如果成功获取数据，更新系统信息表格和图表；如果失败，显示错误消息。

3. **updateCharts(cpuData, memoryData, labels) 函数**
   - 根据传入的CPU使用率和内存使用情况数据更新饼图。
   - 计算总的CPU和内存使用量，并将数据转换为百分比形式。

4. **updateCpuChart(cpuData, labels) 和 updateMemoryChart(memoryData, labels) 函数**
   - 使用Chart.js库绘制CPU使用率和内存使用情况的饼图。

5. **$(document).on('submit', '#shutdownForm', function(event) { ... });**
   - 处理关机按钮的点击事件。
   - 阻止表单的默认提交行为。
   - 如果确认关机，通过Ajax向服务器发送关机请求，并处理成功或失败的响应。

**CSS 部分**

- 提供了页面的样式定义，包括字体、布局、颜色和按钮的样式。
- 使用了灰色背景、圆角边框和阴影效果，使页面看起来更加现代和美观。

**总结**

这个页面通过Ajax动态加载和更新系统信息，并利用Chart.js库展示了CPU使用率和内存使用情况的实时数据。同时，它也包含了一个关机按钮，允许用户在确认后通过Ajax向服务器发送关机请求。

## shell脚本

### **delete_json_files.sh**

Shell脚本实现了定期执行Ansible playbook来配置远程主机，并且在每次执行后清理指定目录下的旧JSON文件，以确保存储的系统信息数据是最新的。

# 效果展示

这里以管理两台虚拟机为例

都为在线状态

![image-20240620172411276](.\image-20240620172411276.png)

**注意：虚拟机处于离线状态时，只会显示在线虚拟机的运行状态**



圆盘信息显示有误，目前还在更新，请尽情期待........
