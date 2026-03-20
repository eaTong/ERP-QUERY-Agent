import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubits/query_cubit.dart';
import '../states/query_state.dart';
import '../services/query_service.dart';
import 'history_page.dart';
import 'login_page.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final _queryController = TextEditingController();
  int _currentIndex = 0;

  @override
  void dispose() {
    _queryController.dispose();
    super.dispose();
  }

  void _handleQuery() {
    context.read<QueryCubit>().query(_queryController.text.trim());
  }

  void _showSqlDialog(String sql) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('生成的 SQL'),
        content: SingleChildScrollView(
          child: SelectableText(
            sql,
            style: const TextStyle(fontFamily: 'monospace'),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('关闭'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ERP 查询智能体'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              Navigator.of(context).pushReplacement(
                MaterialPageRoute(builder: (_) => const LoginPage()),
              );
            },
          ),
        ],
      ),
      body: _currentIndex == 0 ? _buildQueryPage() : const HistoryPage(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (index) {
          setState(() {
            _currentIndex = index;
          });
          if (index == 1) {
            context.read<HistoryCubit>().loadHistory();
          }
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.search),
            label: '查询',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.history),
            label: '历史',
          ),
        ],
      ),
    );
  }

  Widget _buildQueryPage() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // 查询输入区域
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'AI 智能查询',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _queryController,
                    decoration: InputDecoration(
                      hintText: '用自然语言描述你的查询需求...',
                      border: const OutlineInputBorder(),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.send),
                        onPressed: _handleQuery,
                      ),
                    ),
                    maxLines: 3,
                    onSubmitted: (_) => _handleQuery(),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '例如：查询所有状态为已提交的销售订单',
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          // 结果展示区域
          Expanded(
            child: BlocBuilder<QueryCubit, QueryState>(
              builder: (context, state) {
                if (state is QueryLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                if (state is QueryError) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.error_outline, size: 48, color: Colors.red),
                        const SizedBox(height: 16),
                        Text(state.message, textAlign: TextAlign.center),
                        const SizedBox(height: 16),
                        ElevatedButton(
                          onPressed: _handleQuery,
                          child: const Text('重试'),
                        ),
                      ],
                    ),
                  );
                }

                if (state is QuerySuccess) {
                  return _buildResultView(state.result);
                }

                return const Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.search, size: 64, color: Colors.grey),
                      SizedBox(height: 16),
                      Text(
                        '输入查询内容，点击发送按钮获取结果',
                        style: TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultView(QueryResult result) {
    return Column(
      children: [
        // 信息标签
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            Chip(
              avatar: const Icon(Icons.table_restaurant, size: 16),
              label: Text('涉及表: ${result.tables.join(", ")}'),
            ),
            if (result.promptRules.isNotEmpty)
              Chip(
                avatar: const Icon(Icons.rule, size: 16),
                label: Text('规则: ${result.promptRules.join(", ")}'),
              ),
            Chip(
              label: Text('返回 ${result.data.length} 条数据'),
            ),
          ],
        ),
        const SizedBox(height: 8),
        // SQL 按钮
        Align(
          alignment: Alignment.centerRight,
          child: TextButton.icon(
            onPressed: () => _showSqlDialog(result.sql),
            icon: const Icon(Icons.code),
            label: const Text('查看 SQL'),
          ),
        ),
        // 数据表格
        Expanded(
          child: result.data.isEmpty
              ? const Center(child: Text('查询结果为空'))
              : SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: SingleChildScrollView(
                    child: DataTable(
                      columns: result.columns
                          .map((col) => DataColumn(label: Text(col)))
                          .toList(),
                      rows: result.data
                          .map((row) => DataRow(
                                cells: result.columns
                                    .map((col) => DataCell(
                                          Text(row[col]?.toString() ?? '-'),
                                        ))
                                    .toList(),
                              ))
                          .toList(),
                    ),
                  ),
                ),
        ),
      ],
    );
  }
}
