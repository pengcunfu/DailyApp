"""
项目部署文件
1、打包本地资源
2、部署到远程服务器
3、运行远程服务

pip install paramiko scp
通过Docker完成自动化编译任务, 我这里只上传文件
"""
import paramiko
from scp import SCPClient

# 服务器 SSH 配置
SERVER_HOST = "8.155.40.179"
SERVER_USER = "root"
SERVER_PASSWORD = "Bing2003"
REMOTE_PROJECT_PATH = "/home/deploy/project"


def ssh_connect():
    """创建 SSH 连接"""
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect(SERVER_HOST, username=SERVER_USER, password=SERVER_PASSWORD)
    return ssh


def upload_project():
    """上传项目到服务器"""
    print("📤 正在上传源码到服务器...")
    ssh = ssh_connect()

    with SCPClient(ssh.get_transport()) as scp:
        scp.put("./", REMOTE_PROJECT_PATH, recursive=True)

    ssh.close()
    print("✅ 上传完成")


def deploy_project(mode="sync"):
    """在服务器上执行 Docker 编译和运行"""
    print(f"🚀 远程执行 Docker 编译 (模式: {mode})...")
    ssh = ssh_connect()

    commands = [
        f"cd {REMOTE_PROJECT_PATH}",
        "docker-compose down",
        "docker-compose up -d --build" if mode == "async" else "docker-compose up --build"
    ]

    # 运行 Docker 命令
    full_cmd = " && ".join(commands)
    stdin, stdout, stderr = ssh.exec_command(full_cmd)

    if mode == "sync":
        # 监听日志，直到容器启动完成
        while True:
            line = stdout.readline()
            if not line:
                break
            print(line.strip())

    ssh.close()
    print("✅ 部署完成")


if __name__ == "__main__":
    print("选择部署模式:")
    print("1. 监督模式 (sync) - 实时查看 Docker 编译日志")
    print("2. 后台模式 (async) - 上传后程序退出，Docker 后台执行")

    choice = input("请输入 1 或 2: ").strip()
    mode = "sync" if choice == "1" else "async"

    upload_project()
    deploy_project(mode)
