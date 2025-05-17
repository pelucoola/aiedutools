// 错误响应类
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

// 错误处理中间件
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // 记录错误日志
  console.error(err);

  // Mongoose错误处理
  // 无效ObjectId
  if (err.name === 'CastError') {
    const message = `资源不存在`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose重复键
  if (err.code === 11000) {
    const message = '存在重复的字段值';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose验证错误
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || '服务器错误',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

export { ErrorResponse, errorHandler };