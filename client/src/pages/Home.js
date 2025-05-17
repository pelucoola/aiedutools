import React from 'react';
import { Typography, Card, Row, Col, Button } from 'antd';
import { Link } from 'react-router-dom';
import {
  FormOutlined,
  HistoryOutlined,
  ExperimentOutlined,
  FunctionOutlined,
  NodeIndexOutlined
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Home = () => {
  // 学科卡片数据
  const subjects = [
    {
      title: '数学',
      icon: <FunctionOutlined style={{ fontSize: '32px' }} />,
      description: '几何图形面积计算、函数变化、数学公式推导等可视化内容',
      color: '#1890ff'
    },
    {
      title: '物理',
      icon: <ExperimentOutlined style={{ fontSize: '32px' }} />,
      description: '物理实验模拟、力学原理动画、物理现象可视化等',
      color: '#52c41a'
    },
    {
      title: '化学',
      icon: <NodeIndexOutlined style={{ fontSize: '32px' }} />,
      description: '化学反应动画、分子3D结构、元素周期表交互等',
      color: '#fa8c16'
    }
  ];

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <Title>欢迎使用AI教具</Title>
        <Paragraph style={{ fontSize: '16px' }}>
          AI教具是一款面向教育工作者的智能教学辅助工具，旨在帮助各学科教师快速创建交互式、可视化的教学内容。
          <br />
          通过人工智能技术，教师只需输入知识点或教学目标，系统即可自动生成适合课堂演示的交互式网页。
        </Paragraph>
        <Button type="primary" size="large" icon={<FormOutlined />}>
          <Link to="/create">开始创建</Link>
        </Button>
        <Button style={{ marginLeft: '15px' }} size="large" icon={<HistoryOutlined />}>
          <Link to="/history">浏览历史</Link>
        </Button>
      </div>

      <Title level={2} style={{ textAlign: 'center', marginBottom: '20px' }}>支持学科</Title>
      <Row gutter={[16, 16]} justify="center">
        {subjects.map((subject, index) => (
          <Col xs={24} sm={12} md={8} key={index}>
            <Card
              hoverable
              style={{ textAlign: 'center', height: '100%' }}
              bodyStyle={{ 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'space-between',
                height: '100%'
              }}
            >
              <div>
                <div style={{ 
                  color: subject.color, 
                  margin: '20px 0' 
                }}>
                  {subject.icon}
                </div>
                <Title level={3}>{subject.title}</Title>
                <Paragraph>{subject.description}</Paragraph>
              </div>
              <Button type="primary" style={{ marginTop: '15px', backgroundColor: subject.color, borderColor: subject.color }}>
                <Link to={`/create?subject=${subject.title}`}>创建{subject.title}内容</Link>
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ marginTop: '40px', textAlign: 'center' }}>
        <Title level={2}>如何使用</Title>
        <Row gutter={[16, 16]} justify="center">
          <Col xs={24} sm={8}>
            <Card title="1. 选择学科" style={{ textAlign: 'center', height: '100%' }}>
              <p>选择您要教授的学科，如数学、物理或化学</p>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card title="2. 输入知识点" style={{ textAlign: 'center', height: '100%' }}>
              <p>输入您想要教授的具体知识点或教学目标</p>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card title="3. 生成并使用" style={{ textAlign: 'center', height: '100%' }}>
              <p>系统自动生成交互式教学内容，您可以直接在课堂上使用</p>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Home;