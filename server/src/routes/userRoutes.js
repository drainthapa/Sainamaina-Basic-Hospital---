const express = require('express');
const userController = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const validate = require('../middleware/validate');
const { createValidator, updateRoleValidator, setActiveValidator } = require('../validators/userValidators');

const router = express.Router();

router.use(requireAuth, requireRole('super_admin'));

router.get('/', userController.list);
router.get('/roles', userController.listRoles);
router.post('/', createValidator, validate, userController.create);
router.put('/:id/role', updateRoleValidator, validate, userController.updateRole);
router.put('/:id/active', setActiveValidator, validate, userController.setActive);
router.delete('/:id', userController.remove);

module.exports = router;
