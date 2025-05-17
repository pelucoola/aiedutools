export const updateAIConfig = (config) => ({
  type: 'UPDATE_AI_CONFIG',
  payload: config
});

export const fetchAIProviders = () => async (dispatch) => {
  try {
    const response = await axios.get('/api/ai/providers');
    return response.data.providers;
  } catch (error) {
    console.error('获取AI服务提供商失败:', error);
    throw error;
  }
};