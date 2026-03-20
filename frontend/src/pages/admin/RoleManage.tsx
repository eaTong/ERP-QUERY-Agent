import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, TreeSelect, message, Popconfirm, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SettingOutlined } from '@ant-design/icons';
import { roleApi, menuApi, Role, Menu } from '../../services/user';

// 转换菜单数据为 TreeSelect 需要的格式
const convertMenuToTreeSelect = (menus: Menu[]): { value: string; title: string; children: any[] }[] => {
  return menus.map(menu => ({
    value: menu.id,
    title: menu.name,
    children: menu.children ? convertMenuToTreeSelect(menu.children) : [],
  }));
};

export default function RoleManage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [menuModalVisible, setMenuModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>([]);
  const [form] = Form.useForm();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const data = await roleApi.list();
      setRoles(data);
    } catch (error) {
      message.error('获取角色列表失败');
    } finally {
      setLoading(false);
    }
  };

  const [menuTreeData, setMenuTreeData] = useState<any[]>([]);

  const fetchMenus = async () => {
    try {
      const data = await menuApi.getTree();
      const treeData = convertMenuToTreeSelect(data);
      setMenuTreeData(treeData);
    } catch (error) {
      console.error('Failed to fetch menus:', error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchMenus();
  }, []);

  const handleAdd = () => {
    setEditingRole(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({
      name: role.name,
      code: role.code,
      description: role.description,
      status: role.status,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await roleApi.delete(id);
      message.success('删除成功');
      fetchRoles();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleMenuAssign = (role: Role) => {
    setSelectedRole(role);
    setSelectedMenuIds(role.menus?.map((rm) => rm.menu.id) || []);
    setMenuModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRole) {
        await roleApi.update(editingRole.id, values);
        message.success('更新成功');
      } else {
        await roleApi.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchRoles();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || '操作失败';
      message.error(errorMsg);
    }
  };

  const handleMenuSubmit = async () => {
    try {
      if (selectedRole) {
        await roleApi.assignMenus(selectedRole.id, selectedMenuIds);
        message.success('菜单分配成功');
        setMenuModalVisible(false);
        fetchRoles();
      }
    } catch (error) {
      message.error('菜单分配失败');
    }
  };

  const columns = [
    { title: '角色名称', dataIndex: 'name', key: 'name' },
    { title: '角色代码', dataIndex: 'code', key: 'code' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => (
        <Tag color={status === 1 ? 'green' : 'red'}>{status === 1 ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '菜单',
      dataIndex: 'menus',
      key: 'menus',
      render: (_: any, record: Role) => `${record.menus?.length || 0} 个菜单`,
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Role) => (
        <Space>
          <Button size="small" icon={<SettingOutlined />} onClick={() => handleMenuAssign(record)}>
            分配菜单
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
        <h2>角色管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加角色
        </Button>
      </div>

      <Table columns={columns} dataSource={roles} rowKey="id" loading={loading} />

      <Modal
        title={editingRole ? '编辑角色' : '添加角色'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label="角色代码"
            rules={[{ required: true, message: '请输入角色代码' }]}
          >
            <Input disabled={!!editingRole} />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue={1}>
            <Select>
              <Select.Option value={1}>启用</Select.Option>
              <Select.Option value={0}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`分配菜单 - ${selectedRole?.name}`}
        open={menuModalVisible}
        onOk={handleMenuSubmit}
        onCancel={() => setMenuModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={400}
      >
        <div style={{ padding: '16px 0' }}>
          <TreeSelect
            style={{ width: '100%' }}
            treeData={menuTreeData}
            value={selectedMenuIds}
            onChange={setSelectedMenuIds}
            treeCheckable
            showSearch
            treeDefaultExpandAll
            placeholder="选择菜单"
            allowClear
          />
        </div>
      </Modal>
    </div>
  );
}
