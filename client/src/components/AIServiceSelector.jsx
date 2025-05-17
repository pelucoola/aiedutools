import React, { useState, useEffect } from 'react';
import { Select, Form, Card, Button, Space } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;

const AIServiceSelector = ({ value, onChange }) => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({});

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await axios.get('/api/ai/providers');
      setProviders(response.data.providers);
    } catch (error) {
      console.error('获取AI服务提供商失败:', error);
    }
  };

  const handleServiceChange = (value) => {
    onChange({
      provider: value,
      settings: settings[value] || {}
    });
  };

  const handleSettingsChange = (provider, newSettings) => {
    setSettings(prev => ({
      ...prev,
      [provider]: newSettings
    }));
    onChange({
      provider: value?.provider,
      settings: {
        ...value?.settings,
        ...newSettings
      }
    });
  };

  return (
    <Card 
      title="AI服务配置" 
      size="small"
      extra={
        <Button 
          icon={<SettingOutlined />} 
          onClick={() => setShowSettings(!showSettings)}
        >
          高级设置
        </Button>
      }
    >
      <Form.Item label="选择AI服务">
        <Select
          value={value?.provider}
          onChange={handleServiceChange}
          placeholder="请选择AI服务"
          loading={loading}
        >
          {providers.map(provider => (
            <Option key={provider.id} value={provider.id}>
              {provider.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {showSettings && value?.provider && (
        <ServiceSettings 
          provider={value.provider}
          settings={settings[value.provider] || {}}
          onChange={handleSettingsChange}
        />
      )}
    </Card>
  );
};

const ServiceSettings = ({ provider, settings, onChange }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(settings);
  }, [provider, settings, form]);

  const handleFinish = (values) => {
    onChange(provider, values);
  };

  const renderProviderSettings = () => {
    switch (provider) {
      case 'openai':
        return (
          <>
            <Form.Item label="模型" name="model">
              <Select defaultValue="gpt-3.5-turbo">
                <Option value="gpt-3.5-turbo">GPT-3.5 Turbo</Option>
                <Option value="gpt-4">GPT-4</Option>
              </Select>
            </Form.Item>
            <Form.Item label="温度" name="temperature">
              <Slider 
                min={0} 
                max={2} 
                step={0.1} 
                defaultValue={0.7} 
              />
            </Form.Item>
          </>
        );
      case 'tencent':
        return (
          <>
            <Form.Item label="模型" name="model">
              <Select defaultValue="hunyuan-lite">
                <Option value="hunyuan-lite">元宝轻量版</Option>
                <Option value="hunyuan-pro">元宝专业版</Option>
              </Select>
            </Form.Item>
          </>
        );
      case 'volcano':
        return (
          <>
            <Form.Item label="模型" name="model">
              <Select defaultValue="doubao-lite">
                <Option value="doubao-lite">豆包轻量版</Option>
                <Option value="doubao-pro">豆包专业版</Option>
              </Select>
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={settings}
    >
      {renderProviderSettings()}
      <Form.Item>
        <Button type="primary" htmlType="submit">
          保存设置
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AIServiceSelector;