import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Space, Tag, Switch, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { tableMappingApi, dataSourceApi, fieldMappingApi, TableMapping, DataSource, FieldMapping } from '../../services/datasource';

const { Search } = Input;

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
  const [syncingTables, setSyncingTables] = useState(false);
  const [syncingFields, setSyncingFields] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [editingFieldValues, setEditingFieldValues] = useState<Partial<FieldMapping>>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [batchDisplayRules, setBatchDisplayRules] = useState('');
  const [keyword, setKeyword] = useState('');

  const fetchTableMappings = async (searchKeyword?: string) => {
    setLoading(true);
    try {
      const data = await tableMappingApi.list(undefined, searchKeyword);
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
    fetchTableMappings(keyword);
    fetchDataSources();
  }, []);

  const handleSearch = (value: string) => {
    setKeyword(value);
    fetchTableMappings(value);
  };

  const handleSyncTables = async (dataSourceId: string) => {
    setSyncingTables(true);
    try {
      const tables = await dataSourceApi.getTables(dataSourceId);
      const tableList = Array.isArray(tables) ? tables : [];
      setAvailableTables(tableList);
      message.success(`获取到 ${tableList.length} 个表`);
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

  const handleBatchEnable = async (enabled: number) => {
    if (selectedRowKeys.length === 0) return;
    try {
      await Promise.all(selectedRowKeys.map(id => fieldMappingApi.update(id as string, { enabled })));
      message.success(`已${enabled === 1 ? '启用' : '禁用'} ${selectedRowKeys.length} 个字段`);
      setSelectedRowKeys([]);
      if (selectedMapping) {
        const fields = await fieldMappingApi.listByTable(selectedMapping.id);
        setTableFields(fields);
      }
    } catch (error) {
      message.error('批量更新失败');
    }
  };

  const handleBatchSetDisplayRules = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      await Promise.all(selectedRowKeys.map(id => fieldMappingApi.update(id as string, { displayRules: batchDisplayRules })));
      message.success(`已设置 ${selectedRowKeys.length} 个字段的显示规则`);
      setBatchDisplayRules('');
      setSelectedRowKeys([]);
      if (selectedMapping) {
        const fields = await fieldMappingApi.listByTable(selectedMapping.id);
        setTableFields(fields);
      }
    } catch (error) {
      message.error('批量更新失败');
    }
  };

  const handleBatchAutoAlias = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      const updates = selectedRowKeys.map(id => {
        const field = tableFields.find(f => f.id === id);
        if (!field) return { id: id as string, localAlias: '' };
        // 将下划线命名转为驼峰命名
        const alias = field.externalFieldName.replace(/_([a-z])/g, (_: string, c: string) => c.toUpperCase());
        return { id: id as string, localAlias: alias };
      });
      await Promise.all(updates.map(u => fieldMappingApi.update(u.id, { localAlias: u.localAlias })));
      message.success(`已自动生成 ${selectedRowKeys.length} 个字段的本地别名`);
      setSelectedRowKeys([]);
      if (selectedMapping) {
        const fields = await fieldMappingApi.listByTable(selectedMapping.id);
        setTableFields(fields);
      }
    } catch (error) {
      message.error('批量更新失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      await Promise.all(selectedRowKeys.map(id => fieldMappingApi.delete(id as string)));
      message.success(`已删除 ${selectedRowKeys.length} 个字段`);
      setSelectedRowKeys([]);
      if (selectedMapping) {
        const fields = await fieldMappingApi.listByTable(selectedMapping.id);
        setTableFields(fields);
      }
    } catch (error) {
      message.error('批量删除失败');
    }
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
    { title: '外部字段名', dataIndex: 'externalFieldName', key: 'externalFieldName', width: 120, ellipsis: true },
    {
      title: '本地别名',
      dataIndex: 'localAlias',
      key: 'localAlias',
      width: 120,
      ellipsis: true,
      render: (localAlias: string, record: FieldMapping) =>
        editingFieldId === record.id ? (
          <Input
            value={editingFieldValues.localAlias}
            onChange={(e) => setEditingFieldValues({ ...editingFieldValues, localAlias: e.target.value })}
            size="small"
            style={{ width: 100 }}
          />
        ) : (
          <span
            onClick={() => {
              setEditingFieldId(record.id);
              setEditingFieldValues({ localAlias: record.localAlias, enabled: record.enabled, displayRules: record.displayRules });
            }}
            style={{ cursor: 'pointer' }}
            title={localAlias}
          >
            {localAlias}
          </span>
        ),
    },
    { title: '字段描述', dataIndex: 'fieldDescription', key: 'fieldDescription', width: 120, ellipsis: true },
    {
      title: '显示规则',
      dataIndex: 'displayRules',
      key: 'displayRules',
      width: 180,
      ellipsis: true,
      render: (displayRules: string, record: FieldMapping) =>
        editingFieldId === record.id ? (
          <Input.TextArea
            value={editingFieldValues.displayRules}
            onChange={(e) => setEditingFieldValues({ ...editingFieldValues, displayRules: e.target.value })}
            size="small"
            autoSize={{ minRows: 1, maxRows: 3 }}
            placeholder='{"0":"保存","1":"提交"}'
          />
        ) : (
          <span
            onClick={() => {
              setEditingFieldId(record.id);
              setEditingFieldValues({ localAlias: record.localAlias, enabled: record.enabled, displayRules: record.displayRules });
            }}
            style={{ cursor: 'pointer', display: 'block' }}
            title={displayRules}
          >
            {displayRules || '-'}
          </span>
        ),
    },
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
          <Tag
            color={enabled === 1 ? 'green' : 'red'}
            onClick={() => {
              setEditingFieldId(record.id);
              setEditingFieldValues({ localAlias: record.localAlias, enabled: record.enabled, displayRules: record.displayRules });
            }}
            style={{ cursor: 'pointer' }}
          >
            {enabled === 1 ? '启用' : '禁用'}
          </Tag>
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: FieldMapping) =>
        editingFieldId === record.id ? (
          <Space size={4}>
            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => handleSaveField(record.id)} />
            <Button size="small" icon={<CloseOutlined />} onClick={handleCancelEdit} />
          </Space>
        ) : (
          <Button size="small" icon={<EditOutlined />} onClick={() => handleEditField(record)} />
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

      <div style={{ marginBottom: 16 }}>
        <Search
          placeholder="搜索本地别名、外部表名、使用场景"
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
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
          setSelectedRowKeys([]);
        }}
        footer={null}
        width={900}
      >
        <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            onClick={() => selectedMapping?.dataSource && handleSyncFields(selectedMapping)}
            loading={syncingFields}
            icon={<SyncOutlined />}
          >
            同步外部字段
          </Button>
        </div>

        {selectedRowKeys.length > 0 && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f0f5ff', borderRadius: 4 }}>
            <div style={{ marginBottom: 8, fontWeight: 500 }}>
              已选择 {selectedRowKeys.length} 个字段，批量操作：
            </div>
            <Space wrap>
              <Button size="small" onClick={() => handleBatchEnable(1)}>启用</Button>
              <Button size="small" onClick={() => handleBatchEnable(0)}>禁用</Button>
              <Divider type="vertical" />
              <Input
                size="small"
                placeholder="显示规则 JSON"
                value={batchDisplayRules}
                onChange={(e) => setBatchDisplayRules(e.target.value)}
                style={{ width: 200 }}
              />
              <Button size="small" type="primary" onClick={handleBatchSetDisplayRules}>应用显示规则</Button>
              <Divider type="vertical" />
              <Button size="small" onClick={handleBatchAutoAlias}>自动生成别名</Button>
              <Popconfirm title="确认删除所选字段？" onConfirm={handleBatchDelete}>
                <Button size="small" danger>删除所选</Button>
              </Popconfirm>
            </Space>
          </div>
        )}

        <Table
          columns={fieldColumns}
          dataSource={tableFields}
          rowKey="id"
          size="small"
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
        />
      </Modal>
    </div>
  );
}
