import 'package:dio/dio.dart';
import 'api_client.dart';

class User {
  final String id;
  final String username;
  final String? email;
  final String? avatar;

  User({
    required this.id,
    required this.username,
    this.email,
    this.avatar,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      username: json['username'] ?? '',
      email: json['email'],
      avatar: json['avatar'],
    );
  }
}

class AuthService {
  final ApiClient _apiClient = ApiClient.instance;

  /// 登录
  Future<User> login(String username, String password) async {
    try {
      final response = await _apiClient.dio.post(
        '/auth/login',
        data: {
          'username': username,
          'password': password,
        },
      );

      // 保存登录信息
      await _apiClient.saveLoginInfo(username);
      await _apiClient.saveCookies();

      return User.fromJson(response.data);
    } on DioException catch (e) {
      final message = e.response?.data?['error'] ?? '登录失败';
      throw Exception(message);
    }
  }

  /// 登出
  Future<void> logout() async {
    try {
      await _apiClient.dio.post('/auth/logout');
    } catch (e) {
      // 即使失败也清除本地登录信息
    } finally {
      await _apiClient.clearLoginInfo();
    }
  }

  /// 获取当前用户信息
  Future<User> getCurrentUser() async {
    try {
      await _apiClient.loadCookies();
      final response = await _apiClient.dio.get('/auth/me');
      return User.fromJson(response.data);
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        throw Exception('请先登录');
      }
      final message = e.response?.data?['error'] ?? '获取用户信息失败';
      throw Exception(message);
    }
  }

  /// 检查是否已登录
  Future<bool> isLoggedIn() async {
    return _apiClient.isLoggedIn();
  }
}
