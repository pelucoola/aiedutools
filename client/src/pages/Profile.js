import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Avatar,
  Upload,
  message,
  Space,
  Statistic,
  Row,
  Col,
  Switch,
  Divider,
  Typography
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  UploadOutlined,
  EditOutlined,
  SaveOutlined
} from '@ant-design/icons';

const { Title } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  
  // 从Redux获取用户信息
  const { user } = useSelector(state => state.auth);
  
  // 本地状态
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // 模拟的使用统计数据
  const statistics = {
    totalContents: 42,
    totalViews: 1280,
    favoriteSubject: '数学',
    lastActive: '2023-11-01'
  };

  // 处理个人信息更新
  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      // 这里将调用更新用户信息的action
      // await dispatch(updateProfile(values));
      message.success('个人信息已更新');
      setEditing(false);
    } catch (err) {
      message.error('更新失败：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 处理密码更新
  const handleUpdatePassword = async (values) => {
    try {
      setLoading(true);
      // 这里将调用更新密码的action
      // await dispatch(updatePassword(values));
      message.success('密码已更新');
      form.resetFields(['oldPassword', 'newPassword', 'confirmPassword']);
    } catch (err) {
      message.error('更新失败：' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 处理头像上传
  const handleAvatarUpload = async (info) => {
    if (info.file.status === 'done') {
      message.success('头像上传成功');
      // 这里将调用更新头像的action
      // dispatch(updateAvatar(info.file.response.url));
    } else if (info.file.status === 'error') {
      message.error('头像上传失败');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Title level={2}>个人中心</Title>

      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab="个人信息" key="1">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Space direction="vertical" align="center">
                <Avatar
                  size={96}
                  src={user?.avatar}
                  icon={<UserOutlined />}
                />
                <Upload
                  showUploadList={false}
                  onChange={handleAvatarUpload}
                >
                  <Button icon={<UploadOutlined />}>更换头像</Button>
                </Upload>
              </Space>
            </div>

            <Form
              layout="vertical"
              initialValues={{
                username: user?.username,
                email: user?.email,
                subject: user?.subject
              }}
              onFinish={handleUpdateProfile}
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  disabled={!editing}
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="邮箱"
                rules={[
                  { required: true, message: '请输入邮箱' },
                  { type: 'email', message: '请输入有效的邮箱地址' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  disabled={!editing}
                />
              </Form.Item>

              <Form.Item>
                {editing ? (
                  <Space>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      htmlType="submit"
                      loading={loading}
                    >
                      保存
                    </Button>
                    <Button onClick={() => setEditing(false)}>
                      取消
                    </Button>
                  </Space>
                ) : (
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => setEditing(true)}
                  >
                    编辑信息
                  </Button>
                )}
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="修改密码" key="2">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdatePassword}
            >
              <Form.Item
                name="oldPassword"
                label="当前密码"
                rules={[{ required: true, message: '请输入当前密码' }]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="新密码"
                rules={[
                  { required: true, message: '请输入新密码' },
                  { min: 6, message: '密码长度不能少于6位' }
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认新密码"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: '请确认新密码' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('两次输入的密码不一致'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                >
                  更新密码
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="使用统计" key="3">
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="创建的内容"
                    value={statistics.totalContents}
                    suffix="个"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="内容被查看"
                    value={statistics.totalViews}
                    suffix="次"
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="常用学科"
                    value={statistics.favoriteSubject}
                  />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic
                    title="最后活动"
                    value={statistics.lastActive}
                  />
                </Card>
              </Col>
            </Row>
          </TabPane>

          <TabPane tab="偏好设置" key="4">
            <Form layout="vertical">
              <Form.Item
                label="开启自动保存"
                tooltip="每5分钟自动保存正在编辑的内容"
              >
                <Switch defaultChecked />
              </Form.Item>

              <Form.Item
                label="接收邮件通知"
                tooltip="接收系统更新和重要通知"
              >
                <Switch defaultChecked />
              </Form.Item>

              <Form.Item
                label="默认全屏预览"
                tooltip="创建内容时默认使用全屏预览模式"
              >
                <Switch />
              </Form.Item>

              <Divider />

              <Form.Item>
                <Button type="primary">保存设置</Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile;