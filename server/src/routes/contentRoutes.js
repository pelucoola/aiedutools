import express from 'express';
import {
  createContent,
  getContents,
  getContentById,
  updateContent,
  deleteContent,
  searchContents,
  getContentStats
} from '../controllers/contentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 所有路由都需要认证
router.use(protect);

// 内容CRUD操作
router.post('/', createContent);
router.get('/', getContents);
router.get('/search', searchContents);
router.get('/stats', getContentStats);
router.get('/:id', getContentById);
router.put('/:id', updateContent);
router.delete('/:id', deleteContent);

export default router;