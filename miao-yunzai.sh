#!/bin/bash

echo -e "\033[34m本脚本由2786529162编写\033[0m"
sleep 2

curl -fsSL https://deb.nodesource.com/setup_17.x | sudo -E bash -

if [[ -f /etc/centos-release ]]; then
    sudo yum install screen redis chromium git nano -y
else
    sudo apt install nodejs redis chromium-browser git -y
fi

if [[ -f /etc/centos-release ]]; then
    sudo yum groupinstall fonts -y
else
    sudo apt install --no-install-recommends fonts-wqy-microhei -y
fi

redis-server --daemonize yes

git clone --depth=1 https://gitee.com/yoimiya-kokomi/Miao-Yunzai.git

cd Miao-Yunzai

git clone --depth=1 https://gitee.com/yoimiya-kokomi/miao-plugin.git ./plugins/miao-plugin/

npm --registry=https://registry.npmmirror.com install pnpm -g

pnpm config set registry https://registry.npmmirror.com

pnpm install -P

pnpm add puppeteer@19.11.1 -w

echo -e "\033[34m这里报错没关系等登录成功后重新安装pnpm add puppeteer@19.11.1 -w\033[0m"
sleep 2

bash <(curl -sL https://gitee.com/haanxuan/version/raw/master/version.sh)

node app
exit
