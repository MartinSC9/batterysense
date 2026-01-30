const jwt = require('jsonwebtoken');
const db = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No hay token, autorización denegada' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [users] = await db.query(
      'SELECT id, email, role, username FROM users WHERE id = ? AND deleted_at IS NULL',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Token no válido' });
    }

    if (!users[0].is_active) {
      return res.status(401).json({ error: 'Usuario desactivado' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ error: 'Token no válido' });
  }
};

module.exports = auth;
