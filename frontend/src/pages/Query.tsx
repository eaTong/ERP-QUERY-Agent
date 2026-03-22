import { useState, useEffect, useMemo, useRef } from 'react';
import { Input, Button, Card, Spin, Empty, message, Table, Tag, Space, Modal, Drawer, Collapse } from 'antd';
import { SendOutlined, HistoryOutlined, CodeOutlined, TableOutlined, BulbOutlined, FilePdfOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { queryApi } from '../services/api';
import { ChartToolbar } from '../components/query/ChartToolbar';
import { AxisSelector } from '../components/query/AxisSelector';
import { ChartRenderer } from '../components/query/ChartRenderer';
import {
  recommendChartType,
  shouldHideChartType,
  getDefaultAxisFields,
  analyzeFields,
} from '../utils/chartRecommender';
import type { ChartType } from '../utils/chartRecommender';

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

// 解析AI分析结果，分离思考过程和markdown内容
const parseAnalysisResult = (result: string): { thinkProcess: string | null; markdown: string } => {
  const thinkOpenTag = '<think>';
  const thinkCloseTag = '</think>';
  const thinkOpenIndex = result.indexOf(thinkOpenTag);
  const thinkCloseIndex = result.indexOf(thinkCloseTag);

  if (thinkOpenIndex !== -1 && thinkCloseIndex !== -1 && thinkCloseIndex > thinkOpenIndex) {
    const thinkProcess = result.substring(thinkOpenIndex + thinkOpenTag.length, thinkCloseIndex).trim();
    const markdown = result.substring(thinkCloseIndex + thinkCloseTag.length).trim();
    return { thinkProcess, markdown };
  }

  return { thinkProcess: null, markdown: result };
};

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

  // 图表相关状态
  const [isTableView, setIsTableView] = useState(true);
  const [activeChartType, setActiveChartType] = useState<ChartType | null>(null);
  const [xAxisField, setXAxisField] = useState<string>('');
  const [yAxisFields, setYAxisFields] = useState<string[]>([]);

  // PDF导出ref
  const analyzeContentRef = useRef<HTMLDivElement>(null);

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
      // 重置图表视图为表格
      setIsTableView(true);
      setActiveChartType(null);
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

  const handleExportPdf = async () => {
    const content = analyzeContentRef.current;
    if (!content) {
      message.error('无法获取分析内容');
      return;
    }

    try {
      message.loading({ content: '正在生成PDF...', key: 'pdf' });

      // 生成文件名：AI分析报告 + 用户查询内容
      const queryText = input.trim() || '历史查询';
      const sanitizedQuery = queryText.slice(0, 30).replace(/[\\/:*?"<>|]/g, '_');
      const fileName = `AI分析报告_${sanitizedQuery}`;

      // 使用html2canvas截取内容
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${fileName}.pdf`);

      message.success({ content: 'PDF导出成功', key: 'pdf' });
    } catch (error) {
      console.error('PDF export error:', error);
      message.error({ content: 'PDF导出失败', key: 'pdf' });
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

  // 图表推荐计算
  const chartRecommendation = useMemo(() => {
    if (!currentResult?.columns || !currentResult?.data) return null;
    return recommendChartType(currentResult.columns, currentResult.data);
  }, [currentResult?.columns, currentResult?.data]);

  // 隐藏的图表类型
  const hiddenChartTypes = useMemo(() => {
    if (!currentResult?.columns || !currentResult?.data) return [];
    const hidden: ChartType[] = [];
    (['line', 'bar', 'pie', 'ring', 'funnel'] as ChartType[]).forEach(type => {
      if (shouldHideChartType(type, currentResult!.columns, currentResult!.data)) {
        hidden.push(type);
      }
    });
    return hidden;
  }, [currentResult?.columns, currentResult?.data]);

  // 当前图表数据（用于轴选择器）
  const chartColumns = useMemo(() => {
    if (!currentResult?.columns) return [];
    return analyzeFields(currentResult.columns, currentResult.data || []).map(f => f.name);
  }, [currentResult?.columns, currentResult?.data]);

  // 当 activeChartType 变化时，自动设置轴字段
  useEffect(() => {
    if (activeChartType && currentResult?.columns && currentResult?.data) {
      const defaults = getDefaultAxisFields(activeChartType, currentResult.columns, currentResult.data);
      setXAxisField(defaults.xAxis);
      setYAxisFields(defaults.yAxis);
    }
  }, [activeChartType, currentResult?.columns, currentResult?.data]);

  // 图表切换处理
  const handleChartSelect = (type: ChartType) => {
    setActiveChartType(type);
    setIsTableView(false);
  };

  const handleShowTable = () => {
    setIsTableView(true);
  };

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
                        <div
                          className="markdown-content"
                          style={{
                            background: '#fafafa',
                            padding: '12px',
                            borderRadius: '4px',
                            fontSize: '13px',
                            maxHeight: '300px',
                            overflow: 'auto',
                          }}
                        >
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {currentResult.thinkProcess}
                          </ReactMarkdown>
                        </div>
                      ),
                    }]}
                  />
                )}

                {currentResult.data.length > 0 ? (
                  <>
                    {/* 图表工具栏 */}
                    <ChartToolbar
                      recommendation={chartRecommendation}
                      hiddenChartTypes={hiddenChartTypes}
                      activeChart={activeChartType}
                      onChartSelect={handleChartSelect}
                      onShowTable={handleShowTable}
                      isTableView={isTableView}
                    />

                    {/* 轴选择器 - 仅在图表视图下显示 */}
                    {!isTableView && activeChartType && (
                      <AxisSelector
                        columns={chartColumns}
                        chartType={activeChartType}
                        xAxis={xAxisField}
                        yAxis={yAxisFields}
                        onXAxisChange={setXAxisField}
                        onYAxisChange={setYAxisFields}
                      />
                    )}

                    {/* 图表视图 */}
                    {!isTableView && activeChartType ? (
                      <ChartRenderer
                        type={activeChartType}
                        columns={chartColumns}
                        data={currentResult.data}
                        xAxis={xAxisField}
                        yAxis={yAxisFields}
                      />
                    ) : (
                      /* 表格视图 */
                      <Table
                        dataSource={currentResult.data}
                        columns={columns}
                        rowKey={(_, index) => index?.toString() || '0'}
                        pagination={{ pageSize: 20, showSizeChanger: true }}
                        scroll={{ x: 'max-content', y: 400 }}
                        size="small"
                      />
                    )}
                  </>
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
          <Button
            key="export"
            icon={<FilePdfOutlined />}
            onClick={handleExportPdf}
          >
            导出 PDF
          </Button>,
          <Button key="close" type="primary" onClick={() => setAnalyzeModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {analyzeResult && (() => {
          const { thinkProcess, markdown } = parseAnalysisResult(analyzeResult);
          return (
            <div ref={analyzeContentRef}>
              {thinkProcess && (
                <Collapse
                  ghost
                  style={{ marginBottom: '16px' }}
                  items={[{
                    key: 'think',
                    label: '分析过程',
                    children: (
                      <div
                        className="markdown-content"
                        style={{
                          background: '#fafafa',
                          padding: '12px',
                          borderRadius: '4px',
                          fontSize: '13px',
                          maxHeight: '300px',
                          overflow: 'auto',
                        }}
                      >
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {thinkProcess}
                        </ReactMarkdown>
                      </div>
                    ),
                  }]}
                />
              )}
              <div
                className="markdown-content"
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  background: '#fafafa',
                  maxHeight: '500px',
                  overflow: 'auto',
                }}
              >
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdown}
                </ReactMarkdown>
              </div>
            </div>
          );
        })()}
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
