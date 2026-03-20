import { Row, Col, Card, Statistic } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { Line, Column } from '@ant-design/charts';

const lineData = [
  { month: 'Jan', value: 300 },
  { month: 'Feb', value: 450 },
  { month: 'Mar', value: 380 },
  { month: 'Apr', value: 520 },
  { month: 'May', value: 480 },
  { month: 'Jun', value: 610 },
];

const columnData = [
  { category: 'Q1', value: 1200 },
  { category: 'Q2', value: 1500 },
  { category: 'Q3', value: 1100 },
  { category: 'Q4', value: 1800 },
];

const lineConfig = {
  data: lineData,
  xField: 'month',
  yField: 'value',
  smooth: true,
  height: 250,
};

const columnConfig = {
  data: columnData,
  xField: 'category',
  yField: 'value',
  height: 250,
};

function Dashboard() {
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Queries"
              value={1256}
              valueStyle={{ color: '#1677ff' }}
              prefix={<ArrowUpOutlined />}
              suffix=""
            />
            <div style={{ color: '#52c41a', fontSize: '12px', marginTop: '8px' }}>
              +12.5% from last month
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={89}
              valueStyle={{ color: '#52c41a' }}
              prefix={<ArrowUpOutlined />}
            />
            <div style={{ color: '#52c41a', fontSize: '12px', marginTop: '8px' }}>
              +8.2% from last month
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Avg Response Time"
              value={245}
              valueStyle={{ color: '#faad14' }}
              suffix="ms"
              prefix={<ArrowDownOutlined />}
            />
            <div style={{ color: '#52c41a', fontSize: '12px', marginTop: '8px' }}>
              -15ms from last month
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Success Rate"
              value={99.2}
              valueStyle={{ color: '#52c41a' }}
              suffix="%"
            />
            <div style={{ color: '#52c41a', fontSize: '12px', marginTop: '8px' }}>
              +0.3% from last month
            </div>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24} lg={12}>
          <Card title="Query Trends">
            <Line {...lineConfig} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Quarterly Revenue">
            <Column {...columnConfig} />
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default Dashboard;
