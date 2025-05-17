import express from 'express';
import { 
  generateContent,
  getAIProviders 
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 所有路由都需要认证
router.use(protect);

// AI生成相关路由
router.post('/generate', generateContent);
router.get('/providers', getAIProviders);

export default router;