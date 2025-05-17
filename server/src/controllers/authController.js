import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// 生成JWT令牌
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret', {
    expiresIn: '30d',
  });
};

// @desc    注册用户
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, subject } = req.body;

    // 检查用户是否已存在
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: '用户已存在',
      });
    }

    // 创建用户
    const user = await User.create({
      username,
      email,
      password,
      subject,
    });

    if (user) {
      res.status(201).json({
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          subject: user.subject,
          avatar: user.avatar,
          preferences: user.preferences,
        },
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({
        success: false,
        message: '无效的用户数据',
      });
    }
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message,
    });
  }
};

// @desc    用户登录
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 查找用户并包含密码字段
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码不正确',
      });
    }

    // 检查密码
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码不正确',
      });
    }

    // 更新最后登录时间
    user.lastLogin = Date.now();
    await user.save();

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        subject: user.subject,
        avatar: user.avatar,
        preferences: user.preferences,
      },
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message,
    });
  }
};

// @desc    获取当前用户信息
// @route   GET /api/auth/me
// @access  Private
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        subject: user.subject,
        avatar: user.avatar,
        preferences: user.preferences,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message,
    });
  }
};

// @desc    更新用户信息
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    // 更新允许的字段
    const { username, email, subject, avatar, preferences } = req.body;

    if (username) user.username = username;
    if (email) user.email = email;
    if (subject) user.subject = subject;
    if (avatar) user.avatar = avatar;
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences,
      };
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        subject: updatedUser.subject,
        avatar: updatedUser.avatar,
        preferences: updatedUser.preferences,
      },
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message,
    });
  }
};

// @desc    更新用户密码
// @route   PUT /api/auth/password
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 获取用户并包含密码字段
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在',
      });
    }

    // 验证旧密码
    const isMatch = await user.matchPassword(oldPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '当前密码不正确',
      });
    }

    // 更新密码
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: '密码已更新',
    });
  } catch (error) {
    console.error('更新密码错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message,
    });
  }
};

// @desc    获取用户统计信息
// @route   GET /api/auth/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const Content = mongoose.model('Content');
    const stats = await Content.getContentStats(req.user.id);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('获取用户统计信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message,
    });
  }
};