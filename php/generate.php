<?php
// 连接到MySQL数据库
$conn = mysqli_connect("rm-cn-5yd377r1b000p8.rwlb.rds.aliyuncs.com:3306", "wuli", "Forgetvalue78@", "pwuli");

// 检查连接是否成功
if (!$conn) {
    die("连接失败: " . mysqli_connect_error());
}

// 获取长链接
$longUrl = $_POST["longUrl"];

// 生成短链接
$shortUrl = "https://662102.top/" . generateShortUrl();

// 将短链接保存到数据库
$sql = "INSERT INTO short_urls (long_url, short_url) VALUES ('$longUrl', '$shortUrl')";
if (!mysqli_query($conn, $sql)) {
    die("保存短链接失败: " . mysqli_error($conn));
}

// 关闭数据库连接
mysqli_close($conn);

// 返回短链接
echo $shortUrl;

// 生成随机的短链接
function generateShortUrl() {
    $characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    $shortUrl = "";
    for ($i = 0; $i < 6; $i++) {
        $index = rand(0, strlen($characters) - 1);
        $shortUrl .= $characters[$index];
    }
    return $shortUrl;
}
?>