import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 保护路由中间件
export const protect = async (req, res, next) => {
  let token;

  // 检查请求头中是否有token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 获取token
      token = req.headers.authorization.split(' ')[1];

      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');

      // 获取用户信息（不包含密码）
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error('认证失败:', error);
      res.status(401).json({
        success: false,
        message: '认证失败，无效的令牌'
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: '认证失败，未提供令牌'
    });
  }
};

// 管理员权限中间件
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: '没有管理员权限'
    });
  }
};

// 验证请求中间件
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};