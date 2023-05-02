<?php
// 连接数据库
$servername = "rm-cn-5yd377r1b000p8.rwlb.rds.aliyuncs.com";
$username = "wuli";
$password = "Forgetvalue78@";
$dbname = "pwuli";

$conn = new mysqli($servername, $username, $password, $dbname, 3306, NULL, MYSQLI_CLIENT_SSL);
if ($conn->connect_error) {
    die("连接失败: " . $conn->connect_error);
}

// 处理POST请求，生成短链接
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $longUrl = $_POST["longUrl"];
    $shortUrl = generateShortUrl($conn);
    $sql = "INSERT INTO short_urls (long_url, short_url) VALUES ('$longUrl', '$shortUrl')";
    if ($conn->query($sql) === TRUE) {
        echo $shortUrl;
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
}

// 生成短链接
function generateShortUrl($conn) {
    $shortUrl = "https://662102.top/" . rand(100000, 999999);
    $sql = "SELECT short_url FROM short_urls WHERE short_url = '$shortUrl'";
    $result = $conn->query($sql);
    if ($result->num_rows > 0) {
        return generateShortUrl($conn);
    } else {
        return $shortUrl;
    }
}

$conn->close();
?>