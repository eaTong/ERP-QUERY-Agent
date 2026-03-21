import { useState, useEffect } from 'react';
import { Input, Button, Card, Spin, Empty, message, Table, Tag, Space, Modal, Drawer, Collapse } from 'antd';
import { SendOutlined, HistoryOutlined, CodeOutlined, TableOutlined, BulbOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { queryApi } from '../services/api';

const { TextArea } = Input;

interface QueryResult {
  sql: string;
  tables: string[];
  promptRules: string[];
  data: any[];
  columns: string[];
  thinkProcess?: string;
}

interface QueryHistory {
  id: string;
  query: string;
  sql?: string;
  tables?: string;
  status: number;
  createdAt: string;
}

function Query() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [history, setHistory] = useState<QueryHistory[]>([]);
  const [currentResult, setCurrentResult] = useState<QueryResult | null>(null);
  const [sqlModalVisible, setSqlModalVisible] = useState(false);
  const [historyDrawerVisible, setHistoryDrawerVisible] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState<string | null>(null);
  const [analyzeModalVisible, setAnalyzeModalVisible] = useState(false);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await queryApi.getHistory();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (historyDrawerVisible) {
      loadHistory();
    }
  }, [historyDrawerVisible]);

  const handleQuery = async () => {
    if (!input.trim()) {
      message.warning('请输入查询内容');
      return;
    }

    setLoading(true);
    try {
      const result = await queryApi.send(input);
      setCurrentResult(result);
      setInput('');
      // 刷新历史
      if (historyDrawerVisible) {
        loadHistory();
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || '查询失败，请重试';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!currentResult) return;

    setAnalyzeLoading(true);
    try {
      const result = await queryApi.analyze({
        query: input || '历史查询',
        result: currentResult.data,
        thinkProcess: currentResult.thinkProcess || '',
        tables: currentResult.tables,
      });
      setAnalyzeResult(result.analysis);
      setAnalyzeModalVisible(true);
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || '分析失败，请重试';
      message.error(errorMsg);
    } finally {
      setAnalyzeLoading(false);
    }
  };

  const columns: ColumnsType<any> = currentResult?.columns.map((col, index) => ({
    title: col,
    dataIndex: col,
    key: col,
    ellipsis: true,
    fixed: index === 0 ? 'left' : undefined,
    width: 120,
  })) || [];

  return (
    <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 200px)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Card
          title="AI 智能查询"
          extra={
            <Space>
              {currentResult && (
                <>
                  <Button
                    icon={<BulbOutlined />}
                    onClick={handleAnalyze}
                    loading={analyzeLoading}
                  >
                    AI 分析
                  </Button>
                  <Button
                    icon={<CodeOutlined />}
                    onClick={() => setSqlModalVisible(true)}
                  >
                    查看 SQL
                  </Button>
                </>
              )}
              <Button
                icon={<HistoryOutlined />}
                onClick={() => setHistoryDrawerVisible(true)}
              >
                历史
              </Button>
            </Space>
          }
          style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        >
          <TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="用自然语言描述你想要查询的数据，例如：查询所有状态为已提交的销售订单"
            rows={4}
            style={{ marginBottom: '16px' }}
            onPressEnter={(e) => {
              if (e.ctrlKey || e.metaKey) {
                handleQuery();
              }
            }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleQuery}
            loading={loading}
            style={{ marginBottom: '16px', width: 'fit-content' }}
          >
            查询
          </Button>

          <Spin spinning={loading}>
            {currentResult ? (
              <div>
                <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Tag icon={<TableOutlined />} color="blue">
                    涉及表: {currentResult.tables.join(', ')}
                  </Tag>
                  {currentResult.promptRules.length > 0 && (
                    <Tag color="green">
                      使用规则: {currentResult.promptRules.join(', ')}
                    </Tag>
                  )}
                  <Tag color="purple">
                    返回 {currentResult.data.length} 条数据
                  </Tag>
                </div>

                {currentResult.thinkProcess && (
                  <Collapse
                    ghost
                    style={{ marginBottom: '16px' }}
                    items={[{
                      key: 'think',
                      label: 'AI 思考过程',
                      children: (
                        <pre style={{
                          background: '#f5f5f5',
                          padding: '12px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          maxHeight: '200px',
                          overflow: 'auto',
                        }}>
                          {currentResult.thinkProcess}
                        </pre>
                      ),
                    }]}
                  />
                )}

                {currentResult.data.length > 0 ? (
                  <Table
                    dataSource={currentResult.data}
                    columns={columns}
                    rowKey={(_, index) => index?.toString() || '0'}
                    pagination={{ pageSize: 20, showSizeChanger: true }}
                    scroll={{ x: 'max-content', y: 400 }}
                    size="small"
                  />
                ) : (
                  <Empty description="查询结果为空" />
                )}
              </div>
            ) : (
              <Empty description="输入查询内容，点击查询按钮获取结果" />
            )}
          </Spin>
        </Card>
      </div>

      {/* SQL 查看弹窗 */}
      <Modal
        title="生成的 SQL"
        open={sqlModalVisible}
        onCancel={() => setSqlModalVisible(false)}
        footer={[
          <Button key="copy" onClick={() => {
            navigator.clipboard.writeText(currentResult?.sql || '');
            message.success('已复制到剪贴板');
          }}>
            复制
          </Button>,
          <Button key="close" type="primary" onClick={() => setSqlModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        <pre style={{
          background: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
          overflow: 'auto',
          maxHeight: '400px',
          fontFamily: 'monospace',
        }}>
          {currentResult?.sql}
        </pre>
      </Modal>

      {/* AI 分析结果弹窗 */}
      <Modal
        title="AI 分析结果"
        open={analyzeModalVisible}
        onCancel={() => setAnalyzeModalVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setAnalyzeModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={700}
      >
        <div style={{
          background: '#f5f5f5',
          padding: '16px',
          borderRadius: '8px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          maxHeight: '400px',
          overflow: 'auto',
        }}>
          {analyzeResult}
        </div>
      </Modal>

      {/* 历史记录抽屉 */}
      <Drawer
        title="查询历史"
        placement="right"
        onClose={() => setHistoryDrawerVisible(false)}
        open={historyDrawerVisible}
        width={400}
      >
        <Spin spinning={historyLoading}>
          {history.length > 0 ? (
            <div>
              {history.map((item) => (
                <Card
                  key={item.id}
                  size="small"
                  style={{ marginBottom: '12px', cursor: 'pointer' }}
                  hoverable
                >
                  <div style={{ fontSize: '12px', marginBottom: '4px' }}>
                    <strong>查询：</strong>{item.query.slice(0, 50)}
                    {item.query.length > 50 && '...'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#8c8c8c' }}>
                    {new Date(item.createdAt).toLocaleString()} | {item.tables || '无'}
                  </div>
                  <Tag color={item.status === 1 ? 'green' : 'red'} style={{ marginTop: '4px' }}>
                    {item.status === 1 ? '成功' : '失败'}
                  </Tag>
                </Card>
              ))}
            </div>
          ) : (
            <Empty description="暂无查询历史" />
          )}
        </Spin>
      </Drawer>
    </div>
  );
}

export default Query;
