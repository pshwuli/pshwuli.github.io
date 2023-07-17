#!/bin/bash

echo -e "\033[34m洛芳/qq:2786529162的一键脚本            输入1全部安装      输入0结束脚本\033[0m"
echo -n -e "\033[34m您的选择: \033[0m"
read choice

if [ "$choice" == "0" ]; then
  echo "结束脚本"
  exit 0
elif [ "$choice" == "1" ]; then
  show_prompt() {
    echo -e "\033[34m$1\033[0m"
    sleep 0.5
  }

  show_prompt "可以让我直接远程的找我，我会直接远程"
  sleep 2
  show_prompt "添加node.js源"
  curl -fsSL https://deb.nodesource.com/setup_17.x | sudo -E bash -
  show_prompt "安装软件"
  if [ -f "/etc/redhat-release" ]; then
    sudo yum install screen redis chromium git nano -y
  else
    sudo apt install nodejs redis chromium-browser git -y
  fi
  show_prompt "安装字体"
  if [ -f "/etc/redhat-release" ]; then
    sudo yum groupinstall fonts -y
  else
    sudo apt install --no-install-recommends fonts-wqy-microhei -y
  fi
  show_prompt "启用redis服务"
  redis-server --daemonize yes
  show_prompt "安装miao-yunzai"
  git clone --depth=1 https://gitee.com/yoimiya-kokomi/Miao-Yunzai.git
  show_prompt "进入程序目录"
  cd Miao-Yunzai
  show_prompt "克隆miao-plugin(必须)"
  git clone --depth=1 https://gitee.com/yoimiya-kokomi/miao-plugin.git ./plugins/miao-plugin/
  show_prompt "指定国内源npmmirror.com安装pnpm"
  npm --registry=https://registry.npmmirror.com install pnpm -g
  show_prompt "更换国内npm源"
  pnpm config set registry https://registry.npmmirror.com
  show_prompt "安装依赖"
  pnpm install -P
  show_prompt "安装19.11.1版的puppeteer"
  pnpm add puppeteer@19.11.1 -w
  echo -e "\033[34m这里报错没关系等登录成功后重新安装pnpm add puppeteer@19.11.1 -w\033[0m"
  sleep 2
  show_prompt "使用API"
  bash <(curl -sL https://gitee.com/haanxuan/version/raw/master/version.sh)
  node app

  exit 0
else
  echo "无效的选择"
  exit 1
fi
