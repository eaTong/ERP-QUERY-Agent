import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'cubits/auth_cubit.dart';
import 'cubits/query_cubit.dart';
import 'states/auth_state.dart';
import 'pages/login_page.dart';
import 'pages/home_page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => AuthCubit()..checkAuth()),
        BlocProvider(create: (_) => QueryCubit()),
        BlocProvider(create: (_) => HistoryCubit()),
      ],
      child: MaterialApp(
        title: 'ERP 查询智能体',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
          useMaterial3: true,
        ),
        home: BlocBuilder<AuthCubit, AuthState>(
          builder: (context, state) {
            if (state is AuthLoading || state is AuthInitial) {
              return const Scaffold(
                body: Center(child: CircularProgressIndicator()),
              );
            }
            if (state is AuthAuthenticated) {
              return const HomePage();
            }
            return const LoginPage();
          },
        ),
      ),
    );
  }
}
