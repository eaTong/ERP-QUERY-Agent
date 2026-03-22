export type ChartType = 'line' | 'bar' | 'pie' | 'ring' | 'funnel';

export interface ChartRecommendation {
  type: ChartType;
  reason: string;
  xAxisField?: string;
  yAxisFields?: string[];
}

export interface FieldInfo {
  name: string;
  type: 'date' | 'number' | 'string';
  sampleValues?: any[];
}

function inferFieldType(values: any[]): 'date' | 'number' | 'string' {
  if (values.length === 0) return 'string';

  const sample = values.slice(0, 10);

  // Check if all values are numbers
  if (sample.every(v => typeof v === 'number' || (!isNaN(Number(v)) && v !== null && v !== ''))) {
    return 'number';
  }

  // Check if values look like dates
  const datePatterns = [
    /^\d{4}-\d{2}-\d{2}/, // YYYY-MM-DD
    /^\d{4}\/\d{2}\/\d{2}/, // YYYY/MM/DD
    /^\d{2}:\d{2}/, // HH:mm
  ];

  if (sample.every(v => {
    const str = String(v);
    return datePatterns.some(p => p.test(str)) || !isNaN(Date.parse(str));
  })) {
    return 'date';
  }

  return 'string';
}

function checkDescendingTrend(values: number[]): boolean {
  if (values.length < 2) return false;

  let descendingCount = 0;
  for (let i = 1; i < values.length; i++) {
    if (values[i] < values[i - 1]) {
      descendingCount++;
    }
  }

  return descendingCount / (values.length - 1) > 0.6;
}

export function analyzeFields(columns: string[], data: any[]): FieldInfo[] {
  return columns.map(col => {
    const values = data.map(row => row[col]);
    const type = inferFieldType(values);
    return {
      name: col,
      type,
      sampleValues: values.slice(0, 5)
    };
  });
}

export function recommendChartType(columns: string[], data: any[]): ChartRecommendation | null {
  if (!data || data.length === 0 || !columns || columns.length === 0) {
    return null;
  }

  const fields = analyzeFields(columns, data);
  const dateFields = fields.filter(f => f.type === 'date');
  const numberFields = fields.filter(f => f.type === 'number');
  const stringFields = fields.filter(f => f.type === 'string');

  // Rule 1: Time series detection -> recommend line chart
  if (dateFields.length > 0 && numberFields.length > 0) {
    return {
      type: 'line',
      reason: `检测到时间字段 "${dateFields[0].name}" 和 ${numberFields.length} 个数值字段，适合用折线图展示趋势`,
      xAxisField: dateFields[0].name,
      yAxisFields: numberFields.slice(0, 3).map(f => f.name)
    };
  }

  // Rule 2: Multiple numeric columns -> recommend line/bar chart
  if (numberFields.length >= 2) {
    return {
      type: 'line',
      reason: `检测到 ${numberFields.length} 个数值字段，适合用折线图对比趋势`,
      xAxisField: stringFields[0]?.name || columns[0],
      yAxisFields: numberFields.slice(0, 3).map(f => f.name)
    };
  }

  // Rule 3: Single category + single numeric -> recommend pie/ring chart
  if (stringFields.length > 0 && numberFields.length === 1) {
    // Check data volume - pie charts don't work well with too many categories
    const uniqueCategories = new Set(data.map(row => row[stringFields[0].name])).size;
    if (uniqueCategories <= 10) {
      return {
        type: 'pie',
        reason: `检测到分类字段 "${stringFields[0].name}" 和数值字段 "${numberFields[0].name}"，适合用饼图展示占比`,
        xAxisField: stringFields[0].name,
        yAxisFields: [numberFields[0].name]
      };
    }
  }

  // Rule 4: Single numeric column with descending trend -> could use funnel (but manual only)
  if (numberFields.length === 1 && stringFields.length >= 1) {
    const values = data.map(row => Number(row[numberFields[0].name])).filter(v => !isNaN(v));
    if (checkDescendingTrend(values)) {
      return {
        type: 'bar',
        reason: `检测到数值呈下降趋势，适合用柱状图展示`,
        xAxisField: stringFields[0].name,
        yAxisFields: [numberFields[0].name]
      };
    }
  }

  // Rule 5: Default recommendation
  if (numberFields.length === 1 && stringFields.length > 0) {
    const uniqueCategories = new Set(data.map(row => row[stringFields[0].name])).size;
    if (uniqueCategories <= 10) {
      return {
        type: 'pie',
        reason: `适合用饼图展示占比分布`,
        xAxisField: stringFields[0].name,
        yAxisFields: [numberFields[0].name]
      };
    }
    return {
      type: 'bar',
      reason: `适合用柱状图进行对比展示`,
      xAxisField: stringFields[0].name,
      yAxisFields: [numberFields[0].name]
    };
  }

  // Fallback: line chart with first column as x-axis
  if (numberFields.length >= 1) {
    return {
      type: 'line',
      reason: `使用折线图展示数据趋势`,
      xAxisField: fields[0].name,
      yAxisFields: numberFields.slice(0, 3).map(f => f.name)
    };
  }

  return null;
}

export function shouldHideChartType(chartType: ChartType, columns: string[], data: any[]): boolean {
  // Rule: Pie charts don't work well with too much data (> 500 rows or > 15 categories)
  if (chartType === 'pie' || chartType === 'ring') {
    if (data.length > 500) return true;
    const fields = analyzeFields(columns, data);
    const stringFields = fields.filter(f => f.type === 'string');
    if (stringFields.length > 0) {
      const uniqueCategories = new Set(data.map(row => row[stringFields[0].name])).size;
      if (uniqueCategories > 15) return true;
    }
  }
  return false;
}

export function getDefaultAxisFields(chartType: ChartType, columns: string[], data: any[]): { xAxis: string; yAxis: string[] } {
  const recommendation = recommendChartType(columns, data);

  if (recommendation) {
    return {
      xAxis: recommendation.xAxisField || columns[0],
      yAxis: recommendation.yAxisFields || [columns[1]]
    };
  }

  // Fallback defaults
  const fields = analyzeFields(columns, data);
  const numberFields = fields.filter(f => f.type === 'number');

  return {
    xAxis: columns[0],
    yAxis: numberFields.length > 0 ? [numberFields[0].name] : [columns[1] || columns[0]]
  };
}
