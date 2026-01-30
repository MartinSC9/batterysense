const db = require('../config/database');

const getUserById = async (userId) => {
  const [users] = await db.query(
    `SELECT id, email, username, role, first_name, last_name,
            avatar, is_active, created_at, updated_at
     FROM users
     WHERE id = ? AND deleted_at IS NULL`,
    [userId]
  );
  return users[0] || null;
};

const getUserByEmail = async (email) => {
  const [users] = await db.query(
    `SELECT id, email, password_hash, username, role, first_name, last_name,
            avatar, is_active, created_at, updated_at
     FROM users
     WHERE email = ? AND deleted_at IS NULL`,
    [email]
  );
  return users[0] || null;
};

const emailExists = async (email) => {
  const [users] = await db.query(
    'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL',
    [email]
  );
  return users.length > 0;
};

const createAuditLog = async (userId, eventType, details = {}, ipAddress = null) => {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, event_type, details, ip_address, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [userId, eventType, JSON.stringify(details), ipAddress]
    );
  } catch (error) {
    console.error('Error creando audit log:', error);
  }
};

module.exports = {
  getUserById,
  getUserByEmail,
  emailExists,
  createAuditLog,
};
