import express from 'express';
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getPopularTemplates,
  searchTemplates
} from '../controllers/templateController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// 所有路由都需要认证
router.use(protect);

// 模板CRUD操作
router.get('/', getTemplates);
router.get('/popular', getPopularTemplates);
router.get('/search', searchTemplates);
router.get('/:id', getTemplateById);
router.post('/', createTemplate);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);

export default router;