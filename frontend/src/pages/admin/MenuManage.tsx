import { useState, useEffect } from 'react';
import { Tree, Button, Modal, Form, Input, Select, message, Space, Spin, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { DataNode } from 'antd/es/tree';
import { menuApi, Menu } from '../../services/user';

export default function MenuManage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [parentMenu, setParentMenu] = useState<string | undefined>(undefined);
  const [form] = Form.useForm();

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const data = await menuApi.getTree();
      setMenus(data);
    } catch (error) {
      message.error('获取菜单列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // 转换菜单数据为 Tree 组件需要的格式
  const convertToTreeData = (menuList: Menu[]): DataNode[] => {
    return menuList.map((menu) => ({
      key: menu.id,
      title: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>
            {menu.icon && <span style={{ marginRight: 8 }}>{menu.icon}</span>}
            {menu.name}
            {menu.status === 0 && <Tag color="red" style={{ marginLeft: 8 }}>禁用</Tag>}
          </span>
          <Space onClick={(e) => e.stopPropagation()}>
            <Button
              size="small"
              type="text"
              icon={<PlusOutlined />}
              onClick={() => handleAddChild(menu.id)}
            />
            <Button size="small" type="text" icon={<EditOutlined />} onClick={() => handleEdit(menu)} />
            <Button
              size="small"
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(menu.id)}
            />
          </Space>
        </div>
      ),
      children: menu.children ? convertToTreeData(menu.children) : undefined,
      // 保存完整菜单数据
      menuData: menu,
    }));
  };

  const handleAdd = () => {
    setEditingMenu(null);
    setParentMenu(undefined);
    form.resetFields();
    setModalVisible(true);
  };

  const handleAddChild = (parentId: string) => {
    setEditingMenu(null);
    setParentMenu(parentId);
    form.resetFields();
    form.setFieldsValue({ parentId });
    setModalVisible(true);
  };

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setParentMenu(menu.parentId || undefined);
    form.setFieldsValue({
      name: menu.name,
      path: menu.path,
      icon: menu.icon,
      parentId: menu.parentId,
      sort: menu.sort,
      status: menu.status,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await menuApi.delete(id);
      message.success('删除成功');
      fetchMenus();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingMenu) {
        await menuApi.update(editingMenu.id, values);
        message.success('更新成功');
      } else {
        await menuApi.create(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchMenus();
    } catch (error) {
      message.error('操作失败');
    }
  };

  // 获取扁平化的菜单列表（用于父菜单选择）
  const getFlatMenus = (menuList: Menu[], level = 0): { id: string; name: string; level: number }[] => {
    let result: { id: string; name: string; level: number }[] = [];
    menuList.forEach((menu) => {
      result.push({ id: menu.id, name: menu.name, level });
      if (menu.children) {
        result = result.concat(getFlatMenus(menu.children, level + 1));
      }
    });
    return result;
  };

  const flatMenus = getFlatMenus(menus);

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2>菜单管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加菜单
        </Button>
      </div>

      <Spin spinning={loading}>
        <Tree
          treeData={convertToTreeData(menus)}
          showLine={{ showLeafIcon: false }}
          defaultExpandAll
          blockNode
        />
      </Spin>

      <Modal
        title={editingMenu ? '编辑菜单' : '添加菜单'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="菜单名称"
            rules={[{ required: true, message: '请输入菜单名称' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="path"
            label="路径"
            rules={[{ required: true, message: '请输入路径' }]}
          >
            <Input placeholder="/admin/users" />
          </Form.Item>
          <Form.Item name="icon" label="图标">
            <Input placeholder="如: UserOutlined" />
          </Form.Item>
          <Form.Item name="parentId" label="父菜单" initialValue={parentMenu}>
            <Select allowClear placeholder="选择父菜单（不选则为顶级菜单）">
              {flatMenus.map((menu) => (
                <Select.Option key={menu.id} value={menu.id}>
                  {'　'.repeat(menu.level)}{menu.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <Input type="number" placeholder="数字越小越靠前" />
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
