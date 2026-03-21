import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space, Tag, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { tableMappingApi, dataSourceApi, fieldMappingApi, TableMapping, DataSource, FieldMapping } from '../../services/datasource';

export default function TableMappingManage() {
  const [tableMappings, setTableMappings] = useState<TableMapping[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [fieldModalVisible, setFieldModalVisible] = useState(false);
  const [editingMapping, setEditingMapping] = useState<TableMapping | null>(null);
  const [selectedMapping, setSelectedMapping] = useState<TableMapping | null>(null);
  const [tableFields, setTableFields] = useState<any[]>([]);
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [form] = Form.useForm();
  const [fieldForm] = Form.useForm();
  const [syncingTables, setSyncingTables] = useState(false);
  const [syncingFields, setSyncingFields] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editingFieldValues, setEditingFieldValues] = useState<Partial<FieldMapping>>({});

  const fetchTableMappings = async () => {
    setLoading(true);
    try {
      const data = await tableMappingApi.list();
      setTableMappings(data);
    } catch (error) {
      message.error('获取表映射列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchDataSources = async () => {
    try {
      const data = await dataSourceApi.list();
      setDataSources(data.filter((ds) => ds.status === 1));
    } catch (error) {
      console.error('Failed to fetch data sources:', error);
    }
  };

  useEffect(() => {
    fetchTableMappings();
    fetchDataSources();
  }, []);

  const handleSyncTables = async (dataSourceId: string) => {
    setSyncingTables(true);
    try {
      const tables = await dataSourceApi.getTables(dataSourceId);
      setAvailableTables(tables);
      message.success(`获取到 ${tables.length} 个表`);
    } catch (error) {
      message.error('获取表列表失败');
    } finally {
      setSyncingTables(false);
    }
  };

  const handleSyncFields = async (mapping: TableMapping) => {
    setSyncingFields(true);
    try {
      const result = await fieldMappingApi.syncFields(mapping.id);
      if (result.success) {
        message.success(`同步成功: 创建了 ${result.created}/${result.total} 个字段映射`);
      } else {
        message.warning(`同步完成但有错误: ${result.errors.join(', ')}`);
      }
      const fields = await fieldMappingApi.listByTable(mapping.id);
      setTableFields(fields);
    } catch (error) {
      message.error('同步字段映射失败');
    } finally {
      setSyncingFields(false);
    }
  };

  const handleAdd = () => {
    setEditingMapping(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (mapping: TableMapping) => {
    setEditingMapping(mapping);
    form.setFieldsValue({
      dataSourceId: mapping.dataSourceId,
      externalTableName: mapping.externalTableName,
      localAlias: mapping.localAlias,
      useCase: mapping.useCase,
      queryRules: mapping.queryRules,
      enabled: mapping.enabled,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await tableMappingApi.delete(id);
      message.success('删除成功');
      fetchTableMappings();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleManageFields = async (mapping: TableMapping) => {
    setSelectedMapping(mapping);
    try {
      const fields = await fieldMappingApi.listByTable(mapping.id);
      setTableFields(fields);
    } catch (error) {
      setTableFields([]);
    }
    setFieldModalVisible(true);
  };

  const handleAddField = async () => {
    if (!selectedMapping) return;
    try {
      const values = await fieldForm.validateFields();
      await fieldMappingApi.create(selectedMapping.id, values);
      message.success('字段映射创建成功');
      const fields = await fieldMappingApi.listByTable(selectedMapping.id);
      setTableFields(fields);
      fieldForm.resetFields();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || '操作失败';
      message.error(errorMsg);
    }
  };

  const handleDeleteField = async (id: string) => {
    try {
      await fieldMappingApi.delete(id);
      message.success('删除成功');
      if (selectedMapping) {
        const fields = await fieldMappingApi.listByTable(selectedMapping.id);
        setTableFields(fields);
      }
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleEditField = (field: FieldMapping) => {
    setEditingFieldId(field.id);
    setEditingFieldValues({ localAlias: field.localAlias, enabled: field.enabled });
  };

  const handleSaveField = async (id: string) => {
    try {
      await fieldMappingApi.update(id, editingFieldValues);
      message.success('更新成功');
      setEditingFieldId(null);
      setEditingFieldValues({});
      if (selectedMapping) {
        const fields = await fieldMappingApi.listByTable(selectedMapping.id);
        setTableFields(fields);
      }
    } catch (error) {
      message.error('更新失败');
    }
  };

  const handleCancelEdit = () => {
    setEditingFieldId(null);
    setEditingFieldValues({});
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingMapping) {
        await tableMappingApi.update(editingMapping.id, values);
        message.success('更新成功');
      } else {
        await tableMappingApi.create(values as any);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchTableMappings();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || '操作失败';
      message.error(errorMsg);
    }
  };

  const columns = [
    { title: '本地别名', dataIndex: 'localAlias', key: 'localAlias' },
    { title: '外部表名', dataIndex: 'externalTableName', key: 'externalTableName' },
    { title: '数据源', dataIndex: 'dataSource', key: 'dataSource', render: (ds: DataSource) => ds?.name },
    { title: '使用场景', dataIndex: 'useCase', key: 'useCase' },
    { title: '查询规则', dataIndex: 'queryRules', key: 'queryRules' },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: number) => (
        <Tag color={enabled === 1 ? 'green' : 'red'}>{enabled === 1 ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: TableMapping) => (
        <Space>
          <Button size="small" onClick={() => handleManageFields(record)}>
            字段映射
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

  const fieldColumns = [
    { title: '外部字段名', dataIndex: 'externalFieldName', key: 'externalFieldName', width: 150 },
    {
      title: '本地别名',
      dataIndex: 'localAlias',
      key: 'localAlias',
      width: 150,
      render: (localAlias: string, record: FieldMapping) =>
        editingFieldId === record.id ? (
          <Input
            value={editingFieldValues.localAlias}
            onChange={(e) => setEditingFieldValues({ ...editingFieldValues, localAlias: e.target.value })}
            size="small"
            style={{ width: 100 }}
          />
        ) : (
          localAlias
        ),
    },
    { title: '字段描述', dataIndex: 'fieldDescription', key: 'fieldDescription', width: 150 },
    { title: '显示规则', dataIndex: 'displayRules', key: 'displayRules', width: 150 },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled: number, record: FieldMapping) =>
        editingFieldId === record.id ? (
          <Switch
            checked={editingFieldValues.enabled === 1}
            onChange={(checked) => setEditingFieldValues({ ...editingFieldValues, enabled: checked ? 1 : 0 })}
            checkedChildren="启"
            unCheckedChildren="禁"
            size="small"
          />
        ) : (
          <Tag color={enabled === 1 ? 'green' : 'red'}>{enabled === 1 ? '启用' : '禁用'}</Tag>
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: FieldMapping) =>
        editingFieldId === record.id ? (
          <Space>
            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleSaveField(record.id)}>
              保存
            </Button>
            <Button size="small" icon={<CloseOutlined />} onClick={handleCancelEdit}>
              取消
            </Button>
          </Space>
        ) : (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => handleEditField(record)}>
              编辑
            </Button>
            <Popconfirm title="确认删除?" onConfirm={() => handleDeleteField(record.id)}>
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
        <h2>表映射管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加映射
        </Button>
      </div>

      <Table columns={columns} dataSource={tableMappings} rowKey="id" loading={loading} />

      <Modal
        title={editingMapping ? '编辑表映射' : '添加表映射'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="dataSourceId"
            label="数据源"
            rules={[{ required: true, message: '请选择数据源' }]}
          >
            <Select
              placeholder="选择数据源"
              onChange={(value) => handleSyncTables(value)}
            >
              {dataSources.map((ds) => (
                <Select.Option key={ds.id} value={ds.id}>
                  {ds.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="externalTableName"
            label="外部表名"
            rules={[{ required: true, message: '请输入外部表名' }]}
          >
            <Select
              placeholder="请先选择数据源，然后选择或输入表名"
              showSearch
              allowClear
              notFoundContent={syncingTables ? '加载中...' : availableTables.length === 0 ? '请先选择数据源' : null}
              dropdownRender={(menu) => (
                <>
                  {menu}
                  {availableTables.length > 0 && (
                    <div style={{ padding: 8 }}>
                      <Button
                        type="link"
                        size="small"
                        icon={<SyncOutlined spin={syncingTables} />}
                        onClick={() => form.getFieldValue('dataSourceId') && handleSyncTables(form.getFieldValue('dataSourceId'))}
                      >
                        刷新表列表
                      </Button>
                    </div>
                  )}
                </>
              )}
            >
              {availableTables.map((table) => (
                <Select.Option key={table} value={table}>
                  {table}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="localAlias"
            label="本地别名"
            rules={[{ required: true, message: '请输入本地别名' }]}
          >
            <Input placeholder="本地使用的表别名" />
          </Form.Item>
          <Form.Item name="useCase" label="使用场景">
            <Input.TextArea placeholder="描述该表的用途" />
          </Form.Item>
          <Form.Item name="queryRules" label="查询规则">
            <Input.TextArea placeholder="默认查询条件，如: isDelete=0 AND status=1" />
          </Form.Item>
          <Form.Item name="enabled" label="状态" initialValue={1}>
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`字段映射 - ${selectedMapping?.localAlias}`}
        open={fieldModalVisible}
        onCancel={() => {
          setFieldModalVisible(false);
          setSelectedMapping(null);
          setTableFields([]);
        }}
        footer={null}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            onClick={() => selectedMapping?.dataSource && handleSyncFields(selectedMapping)}
            loading={syncingFields}
            icon={<SyncOutlined />}
          >
            同步外部字段
          </Button>
        </div>

        <Form form={fieldForm} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item name="externalFieldName" label="外部字段" rules={[{ required: true }]}>
            <Input placeholder="外部数据库字段名" />
          </Form.Item>
          <Form.Item name="localAlias" label="本地别名" rules={[{ required: true }]}>
            <Input placeholder="本地使用的别名" />
          </Form.Item>
          <Form.Item name="fieldDescription" label="描述">
            <Input placeholder="字段描述" />
          </Form.Item>
          <Form.Item name="displayRules" label="显示规则">
            <Input placeholder='如: {"0":"保存","1":"提交"}' />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleAddField}>
              添加
            </Button>
          </Form.Item>
        </Form>

        <Table columns={fieldColumns} dataSource={tableFields} rowKey="id" size="small" />
      </Modal>
    </div>
  );
}
