const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { auth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/adminAuth');

// Admin routes (require admin role)
router.get('/', auth, requireAdmin, taskController.getAllTasks);
router.get('/:id', auth, requireAdmin, taskController.getTaskById);
router.post('/', auth, requireAdmin, taskController.createTask);
router.put('/:id', auth, requireAdmin, taskController.updateTask);
router.delete('/:id', auth, requireAdmin, taskController.deleteTask);

// User routes
router.get('/user/my-tasks', auth, taskController.getTasksForUser);
router.put('/:id/response', auth, taskController.updateTaskResponse);

module.exports = router;
