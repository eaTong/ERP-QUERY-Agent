import 'package:flutter_bloc/flutter_bloc.dart';
import '../services/query_service.dart';
import '../states/query_state.dart';

class QueryCubit extends Cubit<QueryState> {
  final QueryService _queryService = QueryService();

  QueryCubit() : super(QueryInitial());

  /// 执行查询
  Future<void> query(String queryText) async {
    if (queryText.trim().isEmpty) {
      emit(QueryError('请输入查询内容'));
      return;
    }

    emit(QueryLoading());
    try {
      final result = await _queryService.query(queryText);
      emit(QuerySuccess(result));
    } catch (e) {
      emit(QueryError(e.toString().replaceAll('Exception: ', '')));
    }
  }

  /// 重置状态
  void reset() {
    emit(QueryInitial());
  }
}

class HistoryCubit extends Cubit<HistoryState> {
  final QueryService _queryService = QueryService();

  HistoryCubit() : super(HistoryInitial());

  /// 加载历史记录
  Future<void> loadHistory() async {
    emit(HistoryLoading());
    try {
      final history = await _queryService.getHistory();
      emit(HistoryLoaded(history));
    } catch (e) {
      emit(HistoryError(e.toString().replaceAll('Exception: ', '')));
    }
  }

  /// 删除历史记录
  Future<void> deleteHistory(String id) async {
    try {
      await _queryService.deleteHistory(id);
      await loadHistory();
    } catch (e) {
      emit(HistoryError(e.toString().replaceAll('Exception: ', '')));
    }
  }
}
