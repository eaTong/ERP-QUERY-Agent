class ApiConfig {
  // 后端服务器地址
  // 开发环境：使用本机 IP 或域名
  // 生产环境：替换为实际服务器地址
  static const String baseUrl = 'http://localhost:4000/api';

  // 连接超时时间（毫秒）
  static const int connectTimeout = 30000;

  // 接收超时时间（毫秒）
  static const int receiveTimeout = 30000;
}
