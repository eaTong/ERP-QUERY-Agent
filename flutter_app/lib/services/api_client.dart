import 'package:dio/dio.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api_config.dart';

class ApiClient {
  static ApiClient? _instance;
  late Dio _dio;
  late CookieJar _cookieJar;

  ApiClient._() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: const Duration(milliseconds: ApiConfig.connectTimeout),
      receiveTimeout: const Duration(milliseconds: ApiConfig.receiveTimeout),
      headers: {
        'Content-Type': 'application/json',
      },
    ));

    _cookieJar = CookieJar();
    _dio.interceptors.add(CookieManager(_cookieJar));
  }

  static ApiClient get instance {
    _instance ??= ApiClient._();
    return _instance!;
  }

  Dio get dio => _dio;
  CookieJar get cookieJar => _cookieJar;

  // 从本地存储加载 cookie
  Future<void> loadCookies() async {
    final prefs = await SharedPreferences.getInstance();
    final cookies = prefs.getString('cookies');
    if (cookies != null) {
      await _cookieJar.saveFromResponse(
        Uri.parse(ApiConfig.baseUrl),
        [Cookie.fromSetCookieValue(cookies)],
      );
    }
  }

  // 保存 cookie 到本地存储
  Future<void> saveCookies() async {
    final cookies = await _cookieJar.loadForRequest(Uri.parse(ApiConfig.baseUrl));
    if (cookies.isNotEmpty) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('cookies', cookies.first.toString());
    }
  }

  // 保存登录凭证（用户名）
  Future<void> saveLoginInfo(String username) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('username', username);
  }

  // 获取保存的用户名
  Future<String?> getSavedUsername() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('username');
  }

  // 清除登录信息
  Future<void> clearLoginInfo() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('username');
    await prefs.remove('cookies');
    await _cookieJar.deleteAll();
  }

  // 检查是否已登录
  Future<bool> isLoggedIn() async {
    final username = await getSavedUsername();
    return username != null && username.isNotEmpty;
  }
}
