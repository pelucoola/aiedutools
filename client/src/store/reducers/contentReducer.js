// 初始状态
const initialState = {
  contents: [],
  currentContent: null,
  loading: false,
  error: null,
  generatingContent: false,
  aiConfig: {
    provider: 'openai',
    settings: {
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000
    }
  }
};

// 内容reducer
const contentReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_CONTENTS_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'FETCH_CONTENTS_SUCCESS':
      return {
        ...state,
        contents: action.payload,
        loading: false,
        error: null
      };
    case 'FETCH_CONTENTS_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'FETCH_CONTENT_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'FETCH_CONTENT_SUCCESS':
      return {
        ...state,
        currentContent: action.payload,
        loading: false,
        error: null
      };
    case 'FETCH_CONTENT_FAIL':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'GENERATE_CONTENT_START':
      return {
        ...state,
        generatingContent: true,
        error: null
      };
    case 'GENERATE_CONTENT_SUCCESS':
      return {
        ...state,
        currentContent: action.payload,
        generatingContent: false,
        error: null
      };
    case 'GENERATE_CONTENT_FAIL':
      return {
        ...state,
        generatingContent: false,
        error: action.payload
      };
    case 'SAVE_CONTENT_SUCCESS':
      return {
        ...state,
        contents: [...state.contents, action.payload]
      };
    case 'UPDATE_CONTENT_SUCCESS':
      return {
        ...state,
        contents: state.contents.map(content => 
          content._id === action.payload._id ? action.payload : content
        ),
        currentContent: action.payload
      };
    case 'DELETE_CONTENT_SUCCESS':
      return {
        ...state,
        contents: state.contents.filter(content => content._id !== action.payload)
      };
    case 'CLEAR_CURRENT_CONTENT':
      return {
        ...state,
        currentContent: null
      };
    case 'UPDATE_AI_CONFIG':
      return {
        ...state,
        aiConfig: action.payload
      };
    default:
      return state;
  }
};

export default contentReducer;