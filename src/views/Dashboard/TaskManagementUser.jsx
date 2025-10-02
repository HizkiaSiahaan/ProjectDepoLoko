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
  Alert,
  Snackbar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { format } from 'date-fns';

const blueGradient = 'linear-gradient(90deg, #5de0e6 0%, #2563eb 100%)';

const TaskManagementUser = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    nama: '',
    nipp: '',
    status: ''
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tasks/user/my-tasks', {
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

  const handleOpenDialog = (task) => {
    setSelectedTask(task);
    setFormData({
      nama: task.user_nama || '',
      nipp: task.user_nipp || '',
      status: task.user_response || (task.type === 'checklist' ? 'Belum' : '')
    });
    setOpenDialog(true);
  };

  const handleSubmit = async () => {
    if (!formData.nama || !formData.nipp || !formData.status) {
      showSnackbar('Semua field wajib diisi', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tasks/${selectedTask.id}/response`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showSnackbar('Response berhasil disimpan', 'success');
        setOpenDialog(false);
        fetchTasks();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Gagal menyimpan response');
      }
    } catch (error) {
      showSnackbar(error.message, 'error');
    }
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

  const getStatusChip = (task) => {
    if (!task.user_response) {
      return <Chip label="Belum Dikerjakan" color="warning" size="small" icon={<PendingIcon />} />;
    }
    
    if (task.type === 'checklist') {
      return (
        <Chip 
          label={task.user_response} 
          color={task.user_response === 'Sudah' ? 'success' : 'warning'}
          size="small"
          icon={task.user_response === 'Sudah' ? <CheckCircleIcon /> : <PendingIcon />}
        />
      );
    }
    
    return <Chip label={task.user_response} color="info" size="small" />;
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <Box
          sx={{
            background: blueGradient,
            color: 'white',
            p: 2
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Daftar Task Saya
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
            Klik "Update" untuk mengisi atau mengubah response Anda
          </Typography>
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
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Terakhir Update</strong></TableCell>
                  <TableCell><strong>Aksi</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow 
                    key={task.id}
                    sx={{
                      backgroundColor: isOverdue(task.deadline) && !task.user_response ? 
                        'rgba(255, 152, 0, 0.1)' : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Box>
                        {task.title}
                        {isOverdue(task.deadline) && !task.user_response && (
                          <Chip label="OVERDUE" color="error" size="small" sx={{ ml: 1 }} />
                        )}
                      </Box>
                    </TableCell>
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
                      {task.deadline ? (
                        <Box>
                          {format(new Date(task.deadline), 'dd/MM/yyyy')}
                          {isOverdue(task.deadline) && (
                            <Typography variant="caption" color="error" display="block">
                              Terlambat
                            </Typography>
                          )}
                        </Box>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{getStatusChip(task)}</TableCell>
                    <TableCell>
                      {task.response_updated_at ? 
                        format(new Date(task.response_updated_at), 'dd/MM/yyyy HH:mm') : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(task)}
                        sx={{ minWidth: 'auto' }}
                      >
                        Update
                      </Button>
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

      {/* Update Response Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Update Response: {selectedTask?.title}
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                {selectedTask.description}
              </Typography>
              
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nama Lengkap"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="NIPP"
                    value={formData.nipp}
                    onChange={(e) => setFormData({ ...formData, nipp: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  {selectedTask.type === 'checklist' ? (
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        label="Status"
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <MenuItem value="Belum">Belum</MenuItem>
                        <MenuItem value="Sudah">Sudah</MenuItem>
                      </Select>
                    </FormControl>
                  ) : (
                    <TextField
                      fullWidth
                      label="Nilai/Jawaban"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      multiline
                      rows={3}
                      placeholder="Masukkan nilai atau jawaban Anda..."
                      required
                    />
                  )}
                </Grid>
              </Grid>
              
              {selectedTask.deadline && (
                <Alert 
                  severity={isOverdue(selectedTask.deadline) ? "error" : "info"} 
                  sx={{ mt: 2 }}
                >
                  Deadline: {format(new Date(selectedTask.deadline), 'dd/MM/yyyy')}
                  {isOverdue(selectedTask.deadline) && " (Sudah lewat!)"}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Batal</Button>
          <Button onClick={handleSubmit} variant="contained">
            Simpan Response
          </Button>
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

export default TaskManagementUser;
