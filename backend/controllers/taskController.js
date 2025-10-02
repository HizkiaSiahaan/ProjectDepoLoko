const taskModel = require('../models/taskModel');

// GET all tasks (Admin only)
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await taskModel.getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Gagal mengambil data task', error: error.message });
  }
};

// GET task by ID with responses (Admin only)
exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await taskModel.getTaskById(id);
    
    if (!data.task) {
      return res.status(404).json({ message: 'Task tidak ditemukan' });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Gagal mengambil data task', error: error.message });
  }
};

// CREATE new task (Admin only)
exports.createTask = async (req, res) => {
  try {
    const { title, description, type, deadline } = req.body;
    const created_by = req.user.id;

    // Validation
    if (!title || !type) {
      return res.status(400).json({ message: 'Title dan type wajib diisi' });
    }

    if (!['checklist', 'nilai'].includes(type)) {
      return res.status(400).json({ message: 'Type harus checklist atau nilai' });
    }

    const taskData = {
      title,
      description,
      type,
      deadline: deadline || null,
      created_by
    };

    const newTask = await taskModel.createTask(taskData);
    res.status(201).json({ message: 'Task berhasil dibuat', task: newTask });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Gagal membuat task', error: error.message });
  }
};

// UPDATE task (Admin only)
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, type, deadline } = req.body;

    // Validation
    if (!title || !type) {
      return res.status(400).json({ message: 'Title dan type wajib diisi' });
    }

    if (!['checklist', 'nilai'].includes(type)) {
      return res.status(400).json({ message: 'Type harus checklist atau nilai' });
    }

    const taskData = { title, description, type, deadline: deadline || null };
    const updatedTask = await taskModel.updateTask(id, taskData);

    if (!updatedTask) {
      return res.status(404).json({ message: 'Task tidak ditemukan' });
    }

    res.json({ message: 'Task berhasil diupdate', task: updatedTask });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Gagal mengupdate task', error: error.message });
  }
};

// DELETE task (Admin only)
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedTask = await taskModel.deleteTask(id);

    if (!deletedTask) {
      return res.status(404).json({ message: 'Task tidak ditemukan' });
    }

    res.json({ message: 'Task berhasil dihapus', task: deletedTask });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Gagal menghapus task', error: error.message });
  }
};

// GET tasks for user
exports.getTasksForUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await taskModel.getTasksForUser(userId);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    res.status(500).json({ message: 'Gagal mengambil data task', error: error.message });
  }
};

// UPDATE task response (User)
exports.updateTaskResponse = async (req, res) => {
  try {
    const { id } = req.params; // task id
    const { nama, nipp, status } = req.body;
    const userId = req.user.id;

    // Validation
    if (!nama || !nipp || !status) {
      return res.status(400).json({ message: 'Nama, NIPP, dan status wajib diisi' });
    }

    const responseData = { nama, nipp, status };
    const response = await taskModel.upsertTaskResponse(id, userId, responseData);

    res.json({ message: 'Response berhasil disimpan', response });
  } catch (error) {
    console.error('Error updating task response:', error);
    res.status(500).json({ message: 'Gagal menyimpan response', error: error.message });
  }
};
