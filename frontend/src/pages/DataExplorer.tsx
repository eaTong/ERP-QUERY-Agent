import { useState } from 'react';
import { Card, Select, Input, Button, Space, Row, Col, Tag } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import ResultTable from '../components/common/ResultTable';
import type { ColumnsType } from 'antd/es/table';

const { Option } = Select;

interface DataRecord {
  key: string;
  id: string;
  name: string;
  category: string;
  status: string;
  amount: number;
  date: string;
}

const initialData: DataRecord[] = [
  { key: '1', id: 'ORD-001', name: 'Product A', category: 'Electronics', status: 'Completed', amount: 1500, date: '2024-01-15' },
  { key: '2', id: 'ORD-002', name: 'Product B', category: 'Clothing', status: 'Pending', amount: 850, date: '2024-01-16' },
  { key: '3', id: 'ORD-003', name: 'Product C', category: 'Electronics', status: 'Completed', amount: 2300, date: '2024-01-17' },
  { key: '4', id: 'ORD-004', name: 'Product D', category: 'Food', status: 'Cancelled', amount: 320, date: '2024-01-18' },
  { key: '5', id: 'ORD-005', name: 'Product E', category: 'Electronics', status: 'Completed', amount: 4100, date: '2024-01-19' },
  { key: '6', id: 'ORD-006', name: 'Product F', category: 'Clothing', status: 'Pending', amount: 680, date: '2024-01-20' },
  { key: '7', id: 'ORD-007', name: 'Product G', category: 'Food', status: 'Completed', amount: 920, date: '2024-01-21' },
];

const columns: ColumnsType<DataRecord> = [
  { title: 'ID', dataIndex: 'id', key: 'id', sorter: (a, b) => a.id.localeCompare(b.id) },
  { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a, b) => a.name.localeCompare(b.name) },
  { title: 'Category', dataIndex: 'category', key: 'category', filters: [
    { text: 'Electronics', value: 'Electronics' },
    { text: 'Clothing', value: 'Clothing' },
    { text: 'Food', value: 'Food' },
  ], onFilter: (value, record) => record.category === value },
  { title: 'Status', dataIndex: 'status', key: 'status', render: (status: string) => {
    const colorMap: Record<string, string> = {
      Completed: 'green',
      Pending: 'orange',
      Cancelled: 'red',
    };
    return <Tag color={colorMap[status]}>{status}</Tag>;
  }},
  { title: 'Amount', dataIndex: 'amount', key: 'amount', sorter: (a, b) => a.amount - b.amount, render: (amount: number) => `$${amount.toLocaleString()}` },
  { title: 'Date', dataIndex: 'date', key: 'date', sorter: (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() },
];

function DataExplorer() {
  const [searchText, setSearchText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [data] = useState<DataRecord[]>(initialData);

  const filteredData = data.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase()) ||
      item.id.toLowerCase().includes(searchText.toLowerCase());
    const matchesCategory = !categoryFilter || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <Card>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="Search by name or ID"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              placeholder="Filter by category"
              value={categoryFilter}
              onChange={setCategoryFilter}
              allowClear
              style={{ width: '100%' }}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="Electronics">Electronics</Option>
              <Option value="Clothing">Clothing</Option>
              <Option value="Food">Food</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={8}>
            <Space>
              <Button onClick={() => { setSearchText(''); setCategoryFilter(null); }}>Reset</Button>
              <Button type="primary">Export</Button>
            </Space>
          </Col>
        </Row>
      </Card>
      <Card style={{ marginTop: '16px' }}>
        <ResultTable
          data={filteredData}
          columns={columns}
          pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} items` }}
        />
      </Card>
    </div>
  );
}

export default DataExplorer;
