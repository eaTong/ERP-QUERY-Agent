import React from 'react';
import { Select, Space, Tag } from 'antd';
import type { ChartType } from '../../utils/chartRecommender';

interface AxisSelectorProps {
  columns: string[];
  chartType: ChartType;
  xAxis: string;
  yAxis: string[];
  onXAxisChange: (value: string) => void;
  onYAxisChange: (value: string[]) => void;
}

const chartYAxisLabels: Record<ChartType, string> = {
  line: 'Y轴（数值）',
  bar: 'Y轴（数值）',
  pie: '数值字段',
  ring: '数值字段',
  funnel: '数值字段',
};

export const AxisSelector: React.FC<AxisSelectorProps> = ({
  columns,
  chartType,
  xAxis,
  yAxis,
  onXAxisChange,
  onYAxisChange,
}) => {
  const isPieType = chartType === 'pie' || chartType === 'ring' || chartType === 'funnel';

  return (
    <div
      style={{
        marginBottom: 16,
        padding: '8px 12px',
        background: '#fafafa',
        borderRadius: 6,
        border: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      <Space size={16} wrap>
        {/* X轴选择器 */}
        {!isPieType && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#666', fontSize: 13 }}>
              <Tag color="blue">X轴</Tag>
            </span>
            <Select
              value={xAxis}
              onChange={onXAxisChange}
              style={{ minWidth: 150 }}
              options={columns.map(col => ({ label: col, value: col }))}
              placeholder="选择X轴字段"
            />
          </div>
        )}

        {/* Y轴选择器 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#666', fontSize: 13 }}>
            <Tag color="green">{chartYAxisLabels[chartType]}</Tag>
          </span>
          <Select
            mode="multiple"
            value={yAxis}
            onChange={onYAxisChange}
            style={{ minWidth: 200 }}
            options={columns.map(col => ({ label: col, value: col }))}
            placeholder={isPieType ? '选择数值字段' : '选择Y轴字段（可多选）'}
            maxTagCount={3}
          />
        </div>
      </Space>
    </div>
  );
};
