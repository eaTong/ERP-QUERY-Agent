import 'package:flutter_bloc/flutter_bloc.dart';
import '../services/auth_service.dart';
import '../states/auth_state.dart';

class AuthCubit extends Cubit<AuthState> {
  final AuthService _authService = AuthService();

  AuthCubit() : super(AuthInitial());

  /// 检查登录状态
  Future<void> checkAuth() async {
    emit(AuthLoading());
    try {
      final isLoggedIn = await _authService.isLoggedIn();
      if (isLoggedIn) {
        final user = await _authService.getCurrentUser();
        emit(AuthAuthenticated(user));
      } else {
        emit(AuthUnauthenticated());
      }
    } catch (e) {
      emit(AuthUnauthenticated());
    }
  }

  /// 登录
  Future<void> login(String username, String password) async {
    emit(AuthLoading());
    try {
      final user = await _authService.login(username, password);
      emit(AuthAuthenticated(user));
    } catch (e) {
      emit(AuthError(e.toString().replaceAll('Exception: ', '')));
    }
  }

  /// 登出
  Future<void> logout() async {
    emit(AuthLoading());
    try {
      await _authService.logout();
      emit(AuthUnauthenticated());
    } catch (e) {
      emit(AuthUnauthenticated());
    }
  }
}
