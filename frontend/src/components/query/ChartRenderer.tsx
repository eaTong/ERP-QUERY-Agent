import React, { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import type { ChartType } from '../../utils/chartRecommender';

interface ChartRendererProps {
  type: ChartType;
  columns: string[];
  data: any[];
  xAxis: string;
  yAxis: string[];
}

const CHART_COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'];

export const ChartRenderer: React.FC<ChartRendererProps> = ({
  type,
  columns,
  data,
  xAxis,
  yAxis,
}) => {
  const option: EChartsOption = useMemo(() => {
    if (!data || data.length === 0 || !yAxis || yAxis.length === 0) {
      return {};
    }

    const baseOption: EChartsOption = {
      color: CHART_COLORS,
      tooltip: {
        trigger: type === 'pie' || type === 'ring' ? 'item' : 'axis',
      },
      legend: {
        bottom: 10,
      },
    };

    switch (type) {
      case 'line':
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: data.map(row => row[xAxis]),
            name: xAxis,
          },
          yAxis: {
            type: 'value',
            name: yAxis.join(' / '),
          },
          series: yAxis.map((field, index) => ({
            name: field,
            type: 'line',
            data: data.map(row => row[field]),
            smooth: true,
          })),
          grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true,
          },
        };

      case 'bar':
        return {
          ...baseOption,
          xAxis: {
            type: 'category',
            data: data.map(row => row[xAxis]),
            name: xAxis,
          },
          yAxis: {
            type: 'value',
            name: yAxis.join(' / '),
          },
          series: yAxis.map((field) => ({
            name: field,
            type: 'bar',
            data: data.map(row => row[field]),
          })),
          grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true,
          },
        };

      case 'pie':
        return {
          ...baseOption,
          series: [
            {
              name: yAxis[0],
              type: 'pie',
              radius: ['35%', '60%'],
              center: ['50%', '50%'],
              data: data.map(row => ({
                name: row[xAxis],
                value: row[yAxis[0]],
              })),
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
              label: {
                formatter: '{b}: {d}%',
              },
            },
          ],
        };

      case 'ring':
        return {
          ...baseOption,
          series: [
            {
              name: yAxis[0],
              type: 'pie',
              radius: ['40%', '65%'],
              center: ['50%', '50%'],
              data: data.map(row => ({
                name: row[xAxis],
                value: row[yAxis[0]],
              })),
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: 'rgba(0, 0, 0, 0.5)',
                },
              },
              label: {
                formatter: '{b}: {d}%',
              },
            },
          ],
        };

      case 'funnel':
        return {
          ...baseOption,
          series: [
            {
              name: yAxis[0],
              type: 'funnel',
              left: '10%',
              top: 20,
              bottom: 20,
              width: '80%',
              min: 0,
              max: Math.max(...data.map(row => Number(row[yAxis[0]]) || 0)),
              minSize: '0%',
              maxSize: '100%',
              gap: 2,
              data: data.map(row => ({
                name: row[xAxis],
                value: row[yAxis[0]],
              })).sort((a, b) => b.value - a.value),
              label: {
                position: 'inside',
                formatter: '{b}: {c}',
              },
              emphasis: {
                label: {
                  fontSize: 14,
                },
              },
            },
          ],
        };

      default:
        return {};
    }
  }, [type, columns, data, xAxis, yAxis]);

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
        暂无数据
      </div>
    );
  }

  return (
    <ReactECharts
      option={option}
      style={{ height: 400, width: '100%' }}
      opts={{ renderer: 'canvas' }}
      key={`${type}-${xAxis}-${yAxis.join(',')}`}
    />
  );
};
