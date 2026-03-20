import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../cubits/query_cubit.dart';
import '../states/query_state.dart';
import '../services/query_service.dart';

class HistoryPage extends StatelessWidget {
  const HistoryPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<HistoryCubit, HistoryState>(
      builder: (context, state) {
        if (state is HistoryLoading) {
          return const Center(child: CircularProgressIndicator());
        }

        if (state is HistoryError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 16),
                Text(state.message),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => context.read<HistoryCubit>().loadHistory(),
                  child: const Text('重试'),
                ),
              ],
            ),
          );
        }

        if (state is HistoryLoaded) {
          if (state.history.isEmpty) {
            return const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.history, size: 64, color: Colors.grey),
                  SizedBox(height: 16),
                  Text('暂无查询历史'),
                ],
              ),
            );
          }

          return RefreshIndicator(
            onRefresh: () => context.read<HistoryCubit>().loadHistory(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: state.history.length,
              itemBuilder: (context, index) {
                final item = state.history[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: InkWell(
                    onTap: () => _showDetailDialog(context, item),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(
                                child: Text(
                                  item.query,
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              IconButton(
                                icon: const Icon(Icons.delete_outline),
                                onPressed: () =>
                                    _confirmDelete(context, item.id),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              Icon(Icons.access_time,
                                  size: 14, color: Colors.grey[600]),
                              const SizedBox(width: 4),
                              Text(
                                _formatTime(item.createdAt),
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey[600],
                                ),
                              ),
                              const SizedBox(width: 16),
                              if (item.tables.isNotEmpty) ...[
                                Icon(Icons.table_restaurant,
                                    size: 14, color: Colors.grey[600]),
                                const SizedBox(width: 4),
                                Text(
                                  item.tables.join(', '),
                                  style: TextStyle(
                                    fontSize: 12,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            ),
          );
        }

        return const SizedBox.shrink();
      },
    );
  }

  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final diff = now.difference(time);
    if (diff.inMinutes < 1) {
      return '刚刚';
    } else if (diff.inHours < 1) {
      return '${diff.inMinutes} 分钟前';
    } else if (diff.inDays < 1) {
      return '${diff.inHours} 小时前';
    } else {
      return '${time.month}/${time.day} ${time.hour}:${time.minute.toString().padLeft(2, '0')}';
    }
  }

  void _confirmDelete(BuildContext context, String id) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('确认删除'),
        content: const Text('确定要删除这条查询记录吗？'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('取消'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(ctx).pop();
              context.read<HistoryCubit>().deleteHistory(id);
            },
            child: const Text('删除'),
          ),
        ],
      ),
    );
  }

  void _showDetailDialog(BuildContext context, QueryHistory item) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('查询详情'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('查询内容：',
                  style: TextStyle(fontWeight: FontWeight.bold)),
              Text(item.query),
              const SizedBox(height: 16),
              if (item.sql != null) ...[
                const Text('SQL 语句：',
                    style: TextStyle(fontWeight: FontWeight.bold)),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.grey[100],
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: SelectableText(
                    item.sql!,
                    style: const TextStyle(fontFamily: 'monospace'),
                  ),
                ),
              ],
              const SizedBox(height: 16),
              Text('涉及表：${item.tables.join(", ")}'),
              const SizedBox(height: 8),
              Text('查询时间：${item.createdAt.toString().substring(0, 16)}'),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('关闭'),
          ),
        ],
      ),
    );
  }
}
