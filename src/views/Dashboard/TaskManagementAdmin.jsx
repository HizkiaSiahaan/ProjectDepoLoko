import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Alert,
  Snackbar
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { id as idLocale } from 'date-fns/locale';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { format } from 'date-fns';

const blueGradient = 'linear-gradient(90deg, #5de0e6 0%, #2563eb 100%)';

const TaskManagementAdmin = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskResponses, setTaskResponses] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'checklist',
    deadline: null
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tasks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      } else {
        throw new Error('Gagal mengambil data tasks');
      }
    } catch (error) {
      showSnackbar('Gagal mengambil data tasks', 'error');
    }
    setLoading(false);
  };

  const fetchTaskDetail = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${taskId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedTask(data.task);
        setTaskResponses(data.responses);
        setOpenDetailDialog(true);
      } else {
        throw new Error('Gagal mengambil detail task');
      }
    } catch (error) {
      showSnackbar('Gagal mengambil detail task', 'error');
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const url = editingTask ? `/api/tasks/${editingTask.id}` : '/api/tasks';
      const method = editingTask ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          deadline: formData.deadline ? format(formData.deadline, 'yyyy-MM-dd') : null
        })
      });

      if (response.ok) {
        showSnackbar(editingTask ? 'Task berhasil diupdate' : 'Task berhasil dibuat', 'success');
        handleCloseDialog();
        fetchTasks();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan task');
      }
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus task ini?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        showSnackbar('Task berhasil dihapus', 'success');
        fetchTasks();
      } else {
        throw new Error('Gagal menghapus task');
      }
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
  };

  const handleOpenDialog = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        type: task.type,
        deadline: task.deadline ? new Date(task.deadline) : null
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        type: 'checklist',
        deadline: null
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTask(null);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getTypeChip = (type) => {
    return (
      <Chip 
        label={type === 'checklist' ? 'Checklist' : 'Nilai'} 
        color={type === 'checklist' ? 'primary' : 'secondary'}
        size="small"
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <Box
          sx={{
            background: blueGradient,
            color: 'white',
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Manajemen Task
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
          >
            Tambah Task
          </Button>
        </Box>
        
        <CardContent>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Judul</strong></TableCell>
                  <TableCell><strong>Deskripsi</strong></TableCell>
                  <TableCell><strong>Tipe</strong></TableCell>
                  <TableCell><strong>Deadline</strong></TableCell>
                  <TableCell><strong>Responses</strong></TableCell>
                  <TableCell><strong>Dibuat</strong></TableCell>
                  <TableCell><strong>Aksi</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>
                      {task.description ? 
                        (task.description.length > 50 ? 
                          `${task.description.substring(0, 50)}...` : 
                          task.description
                        ) : '-'
                      }
                    </TableCell>
                    <TableCell>{getTypeChip(task.type)}</TableCell>
                    <TableCell>
                      {task.deadline ? format(new Date(task.deadline), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip label={task.response_count} color="info" size="small" />
                    </TableCell>
                    <TableCell>
                      {format(new Date(task.created_at), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => fetchTaskDetail(task.id)} color="info">
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton onClick={() => handleOpenDialog(task)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(task.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {tasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography color="textSecondary">Belum ada task</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Task Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Tambah Task Baru'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Judul Task"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Deskripsi"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tipe Task</InputLabel>
                <Select
                  value={formData.type}
                  label="Tipe Task"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                >
                  <MenuItem value="checklist">Checklist (Sudah/Belum)</MenuItem>
                  <MenuItem value="nilai">Nilai (Angka/Teks)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={idLocale}>
                <DatePicker
                  label="Deadline (Opsional)"
                  value={formData.deadline}
                  onChange={(newValue) => setFormData({ ...formData, deadline: newValue })}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Batal</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTask ? 'Update' : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Detail Dialog */}
      <Dialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          Detail Task: {selectedTask?.title}
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Deskripsi:</strong> {selectedTask.description || '-'}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Tipe:</strong> {getTypeChip(selectedTask.type)}
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                <strong>Deadline:</strong> {selectedTask.deadline ? format(new Date(selectedTask.deadline), 'dd/MM/yyyy') : '-'}
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 2 }}>Responses dari User:</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Nama</strong></TableCell>
                      <TableCell><strong>NIPP</strong></TableCell>
                      <TableCell><strong>Username</strong></TableCell>
                      <TableCell><strong>Status/Nilai</strong></TableCell>
                      <TableCell><strong>Waktu Update</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {taskResponses.map((response) => (
                      <TableRow key={response.id}>
                        <TableCell>{response.nama}</TableCell>
                        <TableCell>{response.nipp}</TableCell>
                        <TableCell>{response.username || '-'}</TableCell>
                        <TableCell>
                          {selectedTask.type === 'checklist' ? (
                            <Chip 
                              label={response.status} 
                              color={response.status === 'Sudah' ? 'success' : 'warning'}
                              size="small"
                            />
                          ) : (
                            response.status
                          )}
                        </TableCell>
                        <TableCell>
                          {format(new Date(response.updated_at), 'dd/MM/yyyy HH:mm')}
                        </TableCell>
                      </TableRow>
                    ))}
                    {taskResponses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center">
                          <Typography color="textSecondary">Belum ada response</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetailDialog(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaskManagementAdmin;
