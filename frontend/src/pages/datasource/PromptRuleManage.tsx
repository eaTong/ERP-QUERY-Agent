import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Switch, message, Popconfirm, Space } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { promptRuleApi, PromptRule } from '../../services/datasource';

export default function PromptRuleManage() {
  const [promptRules, setPromptRules] = useState<PromptRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRule, setEditingRule] = useState<PromptRule | null>(null);
  const [form] = Form.useForm();

  const fetchPromptRules = async () => {
    setLoading(true);
    try {
      const data = await promptRuleApi.list();
      setPromptRules(data);
    } catch (error) {
      message.error('获取提示词规则列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromptRules();
  }, []);

  const handleAdd = () => {
    setEditingRule(null);
    form.resetFields();
    form.setFieldsValue({ enabled: true });
    setModalVisible(true);
  };

  const handleEdit = (rule: PromptRule) => {
    setEditingRule(rule);
    form.setFieldsValue({
      name: rule.name,
      description: rule.description,
      content: rule.content,
      enabled: rule.enabled === 1,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await promptRuleApi.delete(id);
      message.success('删除成功');
      fetchPromptRules();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleToggle = async (rule: PromptRule) => {
    try {
      await promptRuleApi.update(rule.id, { enabled: rule.enabled === 1 ? 0 : 1 });
      message.success('状态更新成功');
      fetchPromptRules();
    } catch (error) {
      message.error('状态更新失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        enabled: values.enabled ? 1 : 0,
      };
      if (editingRule) {
        await promptRuleApi.update(editingRule.id, data);
        message.success('更新成功');
      } else {
        await promptRuleApi.create(data);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchPromptRules();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || '操作失败';
      message.error(errorMsg);
    }
  };

  const columns = [
    { title: '规则名称', dataIndex: 'name', key: 'name' },
    { title: '规则简介', dataIndex: 'description', key: 'description' },
    {
      title: '内容预览',
      dataIndex: 'content',
      key: 'content',
      render: (content: string) => (
        <span style={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {content.substring(0, 50)}...
        </span>
      ),
    },
    {
      title: '启用状态',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: number, record: PromptRule) => (
        <Switch checked={enabled === 1} onChange={() => handleToggle(record)} />
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: PromptRule) => (
        <Space>
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
        <h2>提示词规则管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加规则
        </Button>
      </div>

      <Table columns={columns} dataSource={promptRules} rowKey="id" loading={loading} />

      <Modal
        title={editingRule ? '编辑提示词规则' : '添加提示词规则'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        okText="确定"
        cancelText="取消"
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="规则名称"
            rules={[{ required: true, message: '请输入规则名称' }]}
          >
            <Input placeholder="规则的唯一名称" />
          </Form.Item>
          <Form.Item name="description" label="规则简介">
            <Input.TextArea placeholder="简要描述规则的用途" rows={2} />
          </Form.Item>
          <Form.Item
            name="content"
            label="提示词内容"
            rules={[{ required: true, message: '请输入提示词内容' }]}
          >
            <Input.TextArea
              placeholder="完整的提示词内容，可以使用变量占位符"
              rows={10}
            />
          </Form.Item>
          <Form.Item name="enabled" label="启用状态" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
