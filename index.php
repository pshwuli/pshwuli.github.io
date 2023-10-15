<?php

// 获取请求的数据
$data = $_GET;

// 构建 API 请求的 URL
$apiUrl = 'https://api.loquat.eu.org/validate/get?' . http_build_query($data);

// 初始化 cURL
$ch = curl_init();

// 设置 cURL 选项
curl_setopt($ch, CURLOPT_URL, $apiUrl); // 设置请求的 URL
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // 将响应保存到变量而不是直接输出
// 如果您的 API 需要身份验证，请根据需要设置以下选项
// curl_setopt($ch, CURLOPT_USERPWD, 'username:password'); // 设置用户名和密码
// curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer your_token']); // 设置身份验证令牌

// 执行 API 请求
$response = curl_exec($ch);

// 检查是否有错误发生
if (curl_errno($ch)) {
    $error = curl_error($ch);
    // 处理错误
} else {
    // 输出 API 响应
    echo $response;
}

// 关闭 cURL 资源
curl_close($ch);
