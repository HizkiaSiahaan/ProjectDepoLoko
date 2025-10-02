// Middleware to check if user is admin
exports.requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User tidak terautentikasi' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Akses ditolak. Hanya admin yang diizinkan.' });
  }
  
  next();
};
