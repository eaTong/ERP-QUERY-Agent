import 'package:dio/dio.dart';
import 'api_client.dart';

class QueryResult {
  final String sql;
  final List<String> tables;
  final List<String> promptRules;
  final List<Map<String, dynamic>> data;
  final List<String> columns;

  QueryResult({
    required this.sql,
    required this.tables,
    required this.promptRules,
    required this.data,
    required this.columns,
  });

  factory QueryResult.fromJson(Map<String, dynamic> json) {
    return QueryResult(
      sql: json['sql'] ?? '',
      tables: List<String>.from(json['tables'] ?? []),
      promptRules: List<String>.from(json['promptRules'] ?? []),
      data: List<Map<String, dynamic>>.from(json['data'] ?? []),
      columns: List<String>.from(json['columns'] ?? []),
    );
  }
}

class QueryHistory {
  final String id;
  final String query;
  final String? sql;
  final List<String> tables;
  final int status;
  final DateTime createdAt;

  QueryHistory({
    required this.id,
    required this.query,
    this.sql,
    required this.tables,
    required this.status,
    required this.createdAt,
  });

  factory QueryHistory.fromJson(Map<String, dynamic> json) {
    return QueryHistory(
      id: json['id'] ?? '',
      query: json['query'] ?? '',
      sql: json['sql'],
      tables: json['tables'] != null
          ? List<String>.from(json['tables'])
          : [],
      status: json['status'] ?? 0,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
    );
  }
}

class QueryService {
  final ApiClient _apiClient = ApiClient.instance;

  /// 执行 AI 查询
  Future<QueryResult> query(String queryText) async {
    try {
      await _apiClient.loadCookies();
      final response = await _apiClient.dio.post(
        '/query',
        data: {'query': queryText},
      );
      return QueryResult.fromJson(response.data);
    } on DioException catch (e) {
      final message = e.response?.data?['error'] ?? '查询失败';
      throw Exception(message);
    }
  }

  /// 获取查询历史
  Future<List<QueryHistory>> getHistory() async {
    try {
      await _apiClient.loadCookies();
      final response = await _apiClient.dio.get('/query/history');
      final List<dynamic> data = response.data['data'] ?? [];
      return data.map((e) => QueryHistory.fromJson(e)).toList();
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        throw Exception('请先登录');
      }
      final message = e.response?.data?['error'] ?? '获取历史记录失败';
      throw Exception(message);
    }
  }

  /// 删除历史记录
  Future<void> deleteHistory(String id) async {
    try {
      await _apiClient.loadCookies();
      await _apiClient.dio.delete('/query/history/$id');
    } on DioException catch (e) {
      final message = e.response?.data?['error'] ?? '删除失败';
      throw Exception(message);
    }
  }
}
