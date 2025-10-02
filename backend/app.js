require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;
require('./db'); // hanya untuk memastikan koneksi dieksekusi

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api/users', require('./routes/userRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API is running!' });
});

const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
app.use('/api/fasilitas', require('./routes/fasilitasRoutes'));
const manpowerRoutes = require('./routes/manpowerRoutes');
app.use('/api/manpower', manpowerRoutes);
app.use('/api/manpower-diklat', require('./routes/manpowerDiklatRoutes'));
app.use('/api/manpower-sertifikasi', require('./routes/manpowerSertifikasiRoutes'));
app.use('/api/pantauan-roda', require('./routes/pantauanRodaRoutes'));
// TODO: Tambahkan routes lain di sini
app.use('/api/action-plan', require('./routes/actionPlanRoute')); // Integrasi Action Plan
const sertifikatSioRoutes = require('./routes/sertifikatSioRoutes');
app.use('/api/sertifikat-sio', sertifikatSioRoutes);

// Routes Desty
app.use('/api/locomotives', require('./routes/locomotiveRoutes'));
app.use('/api/performance', require('./routes/performanceRoutes'));
app.use('/api/fault-history', require('./routes/faultHistoryRoutes'));
app.use('/api/component-usage', require('./routes/componentUsage'));
app.use('/api/tasks', require('./routes/taskRoutes'));

app.listen(3001, () => console.log('Server running on port 3001'));
