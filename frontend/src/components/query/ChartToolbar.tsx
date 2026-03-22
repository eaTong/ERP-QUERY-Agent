import React from 'react';
import { Button, Tooltip, Badge } from 'antd';
import {
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
  TableOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import type { ChartType } from '../../utils/chartRecommender';

interface ChartToolbarProps {
  recommendation: { type: ChartType; reason: string } | null;
  hiddenChartTypes: ChartType[];
  activeChart: ChartType | null;
  onChartSelect: (type: ChartType) => void;
  onShowTable: () => void;
  isTableView: boolean;
}

const chartConfig: Record<ChartType, { icon: React.ReactNode; label: string; color?: string }> = {
  line: { icon: <LineChartOutlined />, label: '折线图', color: '#1677ff' },
  bar: { icon: <BarChartOutlined />, label: '柱状图', color: '#52c41a' },
  pie: { icon: <PieChartOutlined />, label: '饼图', color: '#fa8c16' },
  ring: { icon: <PieChartOutlined />, label: '环形图', color: '#eb2f96' },
  funnel: { icon: <FilterOutlined />, label: '漏斗图', color: '#722ed1' },
};

export const ChartToolbar: React.FC<ChartToolbarProps> = ({
  recommendation,
  hiddenChartTypes,
  activeChart,
  onChartSelect,
  onShowTable,
  isTableView,
}) => {
  const visibleChartTypes = (['line', 'bar', 'pie', 'ring', 'funnel'] as ChartType[]).filter(
    type => !hiddenChartTypes.includes(type)
  );

  return (
    <div style={{ marginBottom: 16 }}>
      {/* 工具栏主体 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 12px',
          background: '#fafafa',
          borderRadius: 6,
          border: '1px solid #f0f0f0',
        }}
      >
        <span style={{ color: '#666', fontSize: 13, marginRight: 4 }}>图表类型：</span>

        {visibleChartTypes.map(type => {
          const config = chartConfig[type];
          const isActive = activeChart === type;

          return (
            <Tooltip key={type} title={config.label}>
              <Button
                type={isActive ? 'primary' : 'default'}
                icon={config.icon}
                onClick={() => onChartSelect(type)}
                style={{
                  ...(isActive && config.color ? { background: config.color, borderColor: config.color } : {}),
                }}
              >
                {config.label}
              </Button>
            </Tooltip>
          );
        })}

        <div style={{ width: 1, height: 24, background: '#d9d9d9', margin: '0 8px' }} />

        <Tooltip title="切换回表格视图">
          <Button
            icon={<TableOutlined />}
            onClick={onShowTable}
            type={isTableView ? 'primary' : 'default'}
          >
            表格
          </Button>
        </Tooltip>
      </div>

      {/* 推荐提示 */}
      {recommendation && isTableView && (
        <div
          style={{
            marginTop: 8,
            padding: '6px 12px',
            background: '#e6f4ff',
            borderRadius: 4,
            border: '1px dashed #91caff',
            color: '#1677ff',
            fontSize: 13,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
          onClick={() => onChartSelect(recommendation.type)}
        >
          <Badge status="info" />
          <span>{recommendation.reason}，点击查看</span>
        </div>
      )}
    </div>
  );
};
