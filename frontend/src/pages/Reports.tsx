import { useState } from 'react';
import { Card, Row, Col, List, Tag, Button, Modal, Form, Input, Select, DatePicker, message, Empty } from 'antd';
import { PlusOutlined, FileTextOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/charts';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface Report {
  id: string;
  name: string;
  type: string;
  date: string;
  status: 'ready' | 'generating';
}

const mockReports: Report[] = [
  { id: '1', name: 'Monthly Sales Report', type: 'Sales', date: '2024-01-15', status: 'ready' },
  { id: '2', name: 'Inventory Summary', type: 'Inventory', date: '2024-01-14', status: 'ready' },
  { id: '3', name: 'Customer Analysis', type: 'Analytics', date: '2024-01-13', status: 'ready' },
  { id: '4', name: 'Revenue by Region', type: 'Finance', date: '2024-01-12', status: 'ready' },
];

const pieData = [
  { type: 'Sales', value: 45000 },
  { type: 'Inventory', value: 28000 },
  { type: 'Analytics', value: 15000 },
  { type: 'Finance', value: 32000 },
];

const pieConfig = {
  data: pieData,
  angleField: 'value',
  colorField: 'type',
  radius: 0.8,
  label: { text: 'value', style: { fontWeight: 600 } },
  legend: { position: 'bottom' as const },
};

const typeColors: Record<string, string> = {
  Sales: 'blue',
  Inventory: 'green',
  Analytics: 'purple',
  Finance: 'orange',
};

function Reports() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleGenerate = async () => {
    try {
      const values = await form.validateFields();
      const newReport: Report = {
        id: Date.now().toString(),
        name: values.name,
        type: values.type,
        date: dayjs().format('YYYY-MM-DD'),
        status: 'generating',
      };
      setReports([newReport, ...reports]);
      setModalVisible(false);
      form.resetFields();
      message.success('Report generated successfully');
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card
            title="Reports"
            extra={
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalVisible(true)}>
                Generate Report
              </Button>
            }
          >
            <List
              dataSource={reports}
              renderItem={(report) => (
                <List.Item
                  actions={[
                    <Button key="view" type="text" icon={<EyeOutlined />}>View</Button>,
                    <Button key="download" type="text" icon={<DownloadOutlined />}>Download</Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={<FileTextOutlined style={{ fontSize: '24px', color: '#1677ff' }} />}
                    title={report.name}
                    description={`${report.type} - ${report.date}`}
                  />
                  <Tag color={typeColors[report.type]}>{report.status}</Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="Report Distribution">
            <Empty
              description="No data"
              style={{ display: pieData.length ? 'none' : 'block' }}
            >
              <div style={{ height: '250px' }}>
                <Pie {...pieConfig} />
              </div>
            </Empty>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Generate New Report"
        open={modalVisible}
        onOk={handleGenerate}
        onCancel={() => setModalVisible(false)}
        okText="Generate"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Report Name" rules={[{ required: true, message: 'Please enter report name' }]}>
            <Input placeholder="e.g., Monthly Sales Report" />
          </Form.Item>
          <Form.Item name="type" label="Report Type" rules={[{ required: true, message: 'Please select report type' }]}>
            <Select placeholder="Select type">
              <Select.Option value="Sales">Sales</Select.Option>
              <Select.Option value="Inventory">Inventory</Select.Option>
              <Select.Option value="Analytics">Analytics</Select.Option>
              <Select.Option value="Finance">Finance</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="Date Range">
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default Reports;
