import { Router } from 'express';
import { fieldMappingController } from '../controllers/fieldMapping';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// 获取某个表映射的字段映射列表
router.get('/table/:tableMappingId', (req, res) => fieldMappingController.getFieldMappings(req, res));
// 创建字段映射
router.post('/table/:tableMappingId', (req, res) => fieldMappingController.createFieldMapping(req, res));
// 同步字段映射（从外部数据库获取）
router.post('/table/:tableMappingId/sync', (req, res) => fieldMappingController.syncFields(req, res));
// 更新字段映射
router.put('/:id', (req, res) => fieldMappingController.updateFieldMapping(req, res));
// 删除字段映射
router.delete('/:id', (req, res) => fieldMappingController.deleteFieldMapping(req, res));

export { router as fieldMappingRouter };
