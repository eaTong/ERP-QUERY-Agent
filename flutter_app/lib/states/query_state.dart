import '../services/query_service.dart';

abstract class QueryState {}

class QueryInitial extends QueryState {}

class QueryLoading extends QueryState {}

class QuerySuccess extends QueryState {
  final QueryResult result;
  QuerySuccess(this.result);
}

class QueryError extends QueryState {
  final String message;
  QueryError(this.message);
}

abstract class HistoryState {}

class HistoryInitial extends HistoryState {}

class HistoryLoading extends HistoryState {}

class HistoryLoaded extends HistoryState {
  final List<QueryHistory> history;
  HistoryLoaded(this.history);
}

class HistoryError extends HistoryState {
  final String message;
  HistoryError(this.message);
}
