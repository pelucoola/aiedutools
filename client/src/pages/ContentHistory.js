import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Table,
  Card,
  Input,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Typography,
  Select
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { confirm } = Modal;

const ContentHistory = () => {
  const dispatch = useDispatch();
  
  // 从Redux获取状态
  const { contents, loading } = useSelector(state => state.content);
  
  // 本地状态
  const [searchText, setSearchText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  // 在组件加载时获取内容列表
  useEffect(() => {
    // 这里将调用获取内容列表的action
    // dispatch(fetchContents());
  }, [dispatch]);

  // 处理内容预览
  const handlePreview = (content) => {
    setSelectedContent(content);
    setPreviewVisible(true);
  };

  // 处理内容编辑
  const handleEdit = (content) => {
    // 导航到创建页面并加载选中的内容
    // history.push(`/create?edit=${content._id}`);
  };

  // 处理内容删除
  const handleDelete = (content) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这个教学内容吗？此操作不可恢复。',
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        try {
          // 这里将调用删除内容的action
          // await dispatch(deleteContent(content._id));
          message.success('内容已删除');
        } catch (err) {
          message.error('删除失败：' + err.message);
        }
      }
    });
  };

  // 表格列定义
  const columns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      filterable: true,
      render: (text, record) => (
        <a onClick={() => handlePreview(record)}>{text}</a>
      )
    },
    {
      title: '学科',
      dataIndex: 'subject',
      key: 'subject',
      render: subject => (
        <Tag color={
          subject === 'math' ? 'blue' :
          subject === 'physics' ? 'green' :
          subject === 'chemistry' ? 'orange' :
          'default'
        }>
          {subject === 'math' ? '数学' :
           subject === 'physics' ? '物理' :
           subject === 'chemistry' ? '化学' :
           subject}
        </Tag>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => new Date(date).toLocaleString()
    },
    {
      title: '最后修改',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: date => new Date(date).toLocaleString()
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          >
            预览
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      )
    }
  ];

  // 筛选内容
  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchText.toLowerCase()) ||
                         content.description?.toLowerCase().includes(searchText.toLowerCase());
    const matchesSubject = !selectedSubject || content.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  return (
    <div>
      <Title level={2}>内容历史</Title>
      
      <Card>
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="搜索内容"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 200 }}
          />
          <Select
            placeholder="选择学科"
            value={selectedSubject}
            onChange={setSelectedSubject}
            allowClear
            style={{ width: 120 }}
          >
            <Option value="math">数学</Option>
            <Option value="physics">物理</Option>
            <Option value="chemistry">化学</Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={filteredContents}
          rowKey="_id"
          loading={loading}
        />
      </Card>

      <Modal
        title="内容预览"
        visible={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="edit" type="primary" onClick={() => handleEdit(selectedContent)}>
            编辑内容
          </Button>,
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>
        ]}
        width={800}
      >
        {selectedContent && (
          <div>
            <h3>{selectedContent.title}</h3>
            <div className="visualization-container">
              {/* 这里将渲染预览内容 */}
              <p>预览内容将在这里显示</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContentHistory;