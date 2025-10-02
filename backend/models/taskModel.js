const db = require('../db');

// GET all tasks with response counts
exports.getAllTasks = async () => {
  const result = await db.query(`
    SELECT 
      t.*,
      COUNT(tr.id) as response_count,
      u.username as created_by_name
    FROM tasks t
    LEFT JOIN task_responses tr ON t.id = tr.task_id
    LEFT JOIN users u ON t.created_by = u.id
    GROUP BY t.id, u.username
    ORDER BY t.created_at DESC
  `);
  return result.rows;
};

// GET task by ID with responses
exports.getTaskById = async (id) => {
  const taskResult = await db.query(`
    SELECT t.*, u.username as created_by_name
    FROM tasks t
    LEFT JOIN users u ON t.created_by = u.id
    WHERE t.id = $1
  `, [id]);
  
  const responsesResult = await db.query(`
    SELECT tr.*, u.username
    FROM task_responses tr
    LEFT JOIN users u ON tr.user_id = u.id
    WHERE tr.task_id = $1
    ORDER BY tr.updated_at DESC
  `, [id]);

  return {
    task: taskResult.rows[0],
    responses: responsesResult.rows
  };
};

// CREATE new task
exports.createTask = async (data) => {
  const { title, description, type, deadline, created_by } = data;
  const result = await db.query(
    `INSERT INTO tasks (title, description, type, deadline, created_by)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [title, description, type, deadline, created_by]
  );
  return result.rows[0];
};

// UPDATE task
exports.updateTask = async (id, data) => {
  const { title, description, type, deadline } = data;
  const result = await db.query(
    `UPDATE tasks 
     SET title = $1, description = $2, type = $3, deadline = $4
     WHERE id = $5 RETURNING *`,
    [title, description, type, deadline, id]
  );
  return result.rows[0];
};

// DELETE task
exports.deleteTask = async (id) => {
  const result = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};

// GET tasks for user (without responses from other users)
exports.getTasksForUser = async (userId) => {
  const result = await db.query(`
    SELECT 
      t.*,
      tr.status as user_response,
      tr.nama as user_nama,
      tr.nipp as user_nipp,
      tr.updated_at as response_updated_at,
      u.username as created_by_name
    FROM tasks t
    LEFT JOIN task_responses tr ON t.id = tr.task_id AND tr.user_id = $1
    LEFT JOIN users u ON t.created_by = u.id
    ORDER BY t.created_at DESC
  `, [userId]);
  return result.rows;
};

// CREATE or UPDATE task response
exports.upsertTaskResponse = async (taskId, userId, data) => {
  const { nama, nipp, status } = data;
  const result = await db.query(`
    INSERT INTO task_responses (task_id, user_id, nama, nipp, status)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (task_id, user_id)
    DO UPDATE SET 
      nama = EXCLUDED.nama,
      nipp = EXCLUDED.nipp,
      status = EXCLUDED.status,
      updated_at = CURRENT_TIMESTAMP
    RETURNING *
  `, [taskId, userId, nama, nipp, status]);
  return result.rows[0];
};
