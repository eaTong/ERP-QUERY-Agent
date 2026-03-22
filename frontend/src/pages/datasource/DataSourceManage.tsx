import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { dataSourceApi, DataSource } from '../../services/datasource';

const { Search } = Input;

export default function DataSourceManage() {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingSource, setEditingSource] = useState<DataSource | null>(null);
  const [form] = Form.useForm();
  const [testingId, setTestingId] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');

  const fetchDataSources = async (searchKeyword?: string) => {
    setLoading(true);
    try {
      const data = await dataSourceApi.list(searchKeyword);
      setDataSources(data);
    } catch (error) {
      message.error('获取数据源列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDataSources(keyword);
  }, []);

  const handleSearch = (value: string) => {
    setKeyword(value);
    fetchDataSources(value);
  };

  const handleAdd = () => {
    setEditingSource(null);
    form.resetFields();
    form.setFieldsValue({ type: 'mysql', port: 3306 });
    setModalVisible(true);
  };

  const handleEdit = (source: DataSource) => {
    setEditingSource(source);
    form.setFieldsValue({
      name: source.name,
      type: source.type,
      host: source.host,
      port: source.port,
      database: source.database,
      username: source.username,
      description: source.description,
      status: source.status,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await dataSourceApi.delete(id);
      message.success('删除成功');
      fetchDataSources();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleTestConnection = async (id: string) => {
    setTestingId(id);
    try {
      const result = await dataSourceApi.testConnection(id);
      if (result.success) {
        message.success(result.message);
      } else {
        message.error(result.message);
      }
    } catch (error) {
      message.error('测试连接失败');
    } finally {
      setTestingId(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingSource) {
        await dataSourceApi.update(editingSource.id, values);
        message.success('更新成功');
      } else {
        await dataSourceApi.create(values as any);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchDataSources();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || '操作失败';
      message.error(errorMsg);
    }
  };

  const columns = [
    { title: '名称', dataIndex: 'name', key: 'name' },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'mysql' ? 'blue' : 'green'}>
          {type === 'mysql' ? 'MySQL' : 'SQL Server'}
        </Tag>
      ),
    },
    { title: '主机', dataIndex: 'host', key: 'host' },
    { title: '端口', dataIndex: 'port', key: 'port' },
    { title: '数据库', dataIndex: 'database', key: 'database' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? '启用' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: DataSource) => (
        <Space>
          <Button
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleTestConnection(record.id)}
            loading={testingId === record.id}
          >
            测试
          </Button>
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确认删除?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>外部数据源管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加数据源
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="搜索名称、主机、数据库"
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </div>

      <Table columns={columns} dataSource={dataSources} rowKey="id" loading={loading} />

      <Modal
        title={editingSource ? '编辑数据源' : '添加数据源'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="名称"
            rules={[{ required: true, message: '请输入数据源名称' }]}
          >
            <Input placeholder="数据源名称" />
          </Form.Item>
          <Form.Item
            name="type"
            label="类型"
            rules={[{ required: true, message: '请选择数据库类型' }]}
          >
            <Select>
              <Select.Option value="mysql">MySQL</Select.Option>
              <Select.Option value="sqlserver">SQL Server</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="host"
            label="主机"
            rules={[{ required: true, message: '请输入主机地址' }]}
          >
            <Input placeholder="localhost 或 IP 地址" />
          </Form.Item>
          <Form.Item
            name="port"
            label="端口"
            rules={[{ required: true, message: '请输入端口号' }]}
          >
            <Input type="number" placeholder="3306" />
          </Form.Item>
          <Form.Item
            name="database"
            label="数据库"
            rules={[{ required: true, message: '请输入数据库名称' }]}
          >
            <Input placeholder="数据库名称" />
          </Form.Item>
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="数据库用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: !editingSource, message: '请输入密码' }]}
          >
            <Input.Password placeholder={editingSource ? '不修改请留空' : '数据库密码'} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="数据源描述" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
