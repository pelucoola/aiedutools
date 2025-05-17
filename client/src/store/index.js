import { createStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';

// 导入各个reducer
import authReducer from './reducers/authReducer';
import contentReducer from './reducers/contentReducer';

// 合并所有reducer
const rootReducer = combineReducers({
  auth: authReducer,
  content: contentReducer,
});

// 创建store
const store = createStore(
  rootReducer,
  applyMiddleware(thunk)
);

export default store;