import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  Form,
  Input,
  Select,
  Button,
  Card,
  Spin,
  message,
  Collapse,
  Space,
  Divider,
  Typography,
  Slider,
  Switch
} from 'antd';
import {
  SendOutlined,
  SaveOutlined,
  FullscreenOutlined,
  SettingOutlined
} from '@ant-design/icons';
import AIServiceSelector from '../components/AIServiceSelector';
import MathVisualization from '../components/visualizations/MathVisualization';
import PhysicsVisualization from '../components/visualizations/PhysicsVisualization';
import ChemistryVisualization from '../components/visualizations/ChemistryVisualization';
import BiologyVisualization from '../components/visualizations/BiologyVisualization';

const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;
const { Title } = Typography;

const CreateContent = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm();
  
  // 从Redux获取状态
  const { generatingContent, currentContent, error } = useSelector(state => state.content);
  
  // 本地状态
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(searchParams.get('subject') || '');
  const [visualizationParams, setVisualizationParams] = useState({});
  const [aiConfig, setAiConfig] = useState({
    provider: 'openai',
    settings: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000
    }
  });

  // 学科选项
  const subjects = [
    { value: 'math', label: '数学' },
    { value: 'physics', label: '物理' },
    { value: 'chemistry', label: '化学' },
    { value: 'biology', label: '生物' }
  ];

  // 处理学科变更
  const handleSubjectChange = (value) => {
    setSelectedSubject(value);
    // 重置可视化参数
    setVisualizationParams({});
  };

  // 处理内容生成
  const handleGenerate = async (values) => {
    try {
      const payload = {
        ...values,
        subject: selectedSubject,
        aiProvider: aiConfig.provider,
        ...aiConfig.settings
      };

      // 这里将调用生成内容的action
      // dispatch(generateContent(payload));
      message.loading('正在生成内容...', 0);
    } catch (err) {
      message.error('生成内容失败：' + err.message);
    }
  };

  // 处理内容保存
  const handleSave = async () => {
    try {
      // 这里将调用保存内容的action
      // dispatch(saveContent(currentContent));
      message.success('内容已保存');
    } catch (err) {
      message.error('保存失败：' + err.message);
    }
  };

  // 切换全屏模式
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 更新可视化参数
  const handleParamChange = (paramName, value) => {
    setVisualizationParams(prev => ({
      ...prev,
      [paramName]: value
    }));
  };

  return (
    <div className="create-content-container">
      <Title level={2}>创建教学内容</Title>
      <Divider />
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleGenerate}
        initialValues={{
          subject: selectedSubject
        }}
      >
        <AIServiceSelector 
          value={aiConfig}
          onChange={setAiConfig}
        />

        <Form.Item
          name="subject"
          label="选择学科"
          rules={[{ required: true, message: '请选择学科' }]}
        >
          <Select
            placeholder="请选择学科"
            onChange={handleSubjectChange}
            style={{ maxWidth: 200 }}
          >
            {subjects.map(subject => (
              <Option key={subject.value} value={subject.value}>
                {subject.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="knowledge"
          label="知识点描述"
          rules={[{ required: true, message: '请输入要教授的知识点' }]}
        >
          <TextArea
            placeholder="请详细描述您要教授的知识点，例如：圆的面积公式及其推导过程"
            rows={4}
          />
        </Form.Item>

        <Form.Item
          name="additionalInstructions"
          label="额外要求"
        >
          <TextArea
            placeholder="请输入对生成内容的额外要求，例如：需要分步骤展示推导过程"
            rows={2}
          />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button
              type="primary"
              icon={<SendOutlined />}
              htmlType="submit"
              loading={generatingContent}
            >
              生成内容
            </Button>
            {currentContent && (
              <>
                <Button
                  icon={<SaveOutlined />}
                  onClick={handleSave}
                >
                  保存内容
                </Button>
                <Button
                  icon={<FullscreenOutlined />}
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? '退出全屏' : '全屏展示'}
                </Button>
              </>
            )}
          </Space>
        </Form.Item>
      </Form>

      {currentContent && (
        <>
          <Divider />
          <Card
            title="预览"
            extra={
              <Button icon={<SettingOutlined />} onClick={() => {}}>
                调整参数
              </Button>
            }
            className={isFullscreen ? 'fullscreen-mode' : ''}
          >
            <div className="visualization-container">
              {generatingContent ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <Spin size="large" />
                  <p>正在生成内容，请稍候...</p>
                </div>
              ) : (
                <>
                  {selectedSubject === 'math' && (
                    <MathVisualization 
                      content={currentContent} 
                      params={visualizationParams}
                      onParamChange={handleParamChange}
                    />
                  )}
                  {selectedSubject === 'physics' && (
                    <PhysicsVisualization 
                      content={currentContent} 
                      params={visualizationParams}
                      onParamChange={handleParamChange}
                    />
                  )}
                  {selectedSubject === 'chemistry' && (
                    <ChemistryVisualization 
                      content={currentContent} 
                      params={visualizationParams}
                      onParamChange={handleParamChange}
                    />
                  )}
                  {selectedSubject === 'biology' && (
                    <BiologyVisualization 
                      content={currentContent} 
                      params={visualizationParams}
                      onParamChange={handleParamChange}
                    />
                  )}
                </>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default CreateContent;