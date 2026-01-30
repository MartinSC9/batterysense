const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { ROLES, ALLOWED_ROLES_REGISTER, JWT_CONFIG, AUDIT_EVENTS } = require('../constants');
const { getUserById, getUserByEmail, emailExists, createAuditLog } = require('../helpers/dbHelpers');
const { isValidEmail, isValidPassword, isValidRoleForRegister } = require('../helpers/validationHelpers');
const {
  sendSuccess,
  sendCreated,
  sendValidationError,
  sendUnauthorized,
  sendServerError,
} = require('../helpers/responseHelpers');

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

const saveRefreshToken = async (userId, token) => {
  const expiresAt = JWT_CONFIG.getRefreshTokenExpiry();
  await db.query(
    `INSERT INTO refresh_tokens (user_id, token, expires_at, created_at)
     VALUES (?, ?, ?, NOW())`,
    [userId, token, expiresAt]
  );
};

// Verificar si el email existe (flujo unificado)
const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return sendValidationError(res, 'Email inválido');
    }

    const user = await getUserByEmail(email);

    if (user) {
      if (!user.is_active) {
        return sendValidationError(res, 'Esta cuenta está desactivada');
      }
      return sendSuccess(res, { exists: true, email });
    }

    return sendSuccess(res, { exists: false, email });
  } catch (error) {
    return sendServerError(res, error, 'verificar email');
  }
};

// Registro
const register = async (req, res) => {
  try {
    const { email, password, username, first_name, last_name, role = ROLES.CLIENTE } = req.body;

    // Validaciones
    if (!email || !password) {
      return sendValidationError(res, 'Email y contraseña son requeridos');
    }

    if (!isValidEmail(email)) {
      return sendValidationError(res, 'Email inválido');
    }

    if (!isValidPassword(password)) {
      return sendValidationError(res, 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
    }

    if (!isValidRoleForRegister(role)) {
      return sendValidationError(res, 'Rol no válido para registro');
    }

    // Verificar email único
    if (await emailExists(email)) {
      return sendValidationError(res, 'El email ya está registrado');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Insertar usuario
    const [result] = await db.query(
      `INSERT INTO users (email, password_hash, username, first_name, last_name, role, is_active, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())`,
      [email, password_hash, username || null, first_name || null, last_name || null, role]
    );

    const userId = result.insertId;

    // Generar tokens
    const token = generateToken(userId);
    const refreshToken = generateRefreshToken(userId);
    await saveRefreshToken(userId, refreshToken);

    // Obtener usuario creado (sin password)
    const user = await getUserById(userId);

    // Audit log
    await createAuditLog(userId, AUDIT_EVENTS.REGISTER, { role }, req.ip);

    return sendCreated(res, {
      user,
      token,
      refreshToken,
    }, 'Usuario registrado exitosamente');
  } catch (error) {
    return sendServerError(res, error, 'registro');
  }
};

// Login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendValidationError(res, 'Email y contraseña son requeridos');
    }

    // Buscar usuario
    const user = await getUserByEmail(email);

    if (!user) {
      return sendUnauthorized(res, 'Credenciales inválidas');
    }

    if (!user.is_active) {
      return sendUnauthorized(res, 'Esta cuenta está desactivada');
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return sendUnauthorized(res, 'Credenciales inválidas');
    }

    // Generar tokens
    const token = generateToken(user.id);
    const refreshToken = generateRefreshToken(user.id);
    await saveRefreshToken(user.id, refreshToken);

    // Actualizar last_login
    await db.query('UPDATE users SET updated_at = NOW() WHERE id = ?', [user.id]);

    // Audit log
    await createAuditLog(user.id, AUDIT_EVENTS.LOGIN, {}, req.ip);

    // Remover password_hash del objeto
    const { password_hash, ...userWithoutPassword } = user;

    return sendSuccess(res, {
      user: userWithoutPassword,
      token,
      refreshToken,
    }, 'Login exitoso');
  } catch (error) {
    return sendServerError(res, error, 'login');
  }
};

// Obtener usuario actual
const me = async (req, res) => {
  try {
    const user = await getUserById(req.user.id);

    if (!user) {
      return sendUnauthorized(res, 'Usuario no encontrado');
    }

    return sendSuccess(res, { user });
  } catch (error) {
    return sendServerError(res, error, 'obtener usuario');
  }
};

// Logout
const logout = async (req, res) => {
  try {
    // Eliminar refresh tokens del usuario
    await db.query('DELETE FROM refresh_tokens WHERE user_id = ?', [req.user.id]);

    // Audit log
    await createAuditLog(req.user.id, AUDIT_EVENTS.LOGOUT, {}, req.ip);

    return sendSuccess(res, {}, 'Logout exitoso');
  } catch (error) {
    return sendServerError(res, error, 'logout');
  }
};

// Refresh token
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return sendValidationError(res, 'Refresh token requerido');
    }

    // Verificar token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return sendUnauthorized(res, 'Refresh token inválido o expirado');
    }

    // Verificar que el token existe en la BD
    const [tokens] = await db.query(
      'SELECT * FROM refresh_tokens WHERE token = ? AND user_id = ? AND expires_at > NOW()',
      [refreshToken, decoded.userId]
    );

    if (tokens.length === 0) {
      return sendUnauthorized(res, 'Refresh token no válido');
    }

    // Generar nuevo access token
    const newToken = generateToken(decoded.userId);

    // Obtener usuario
    const user = await getUserById(decoded.userId);

    return sendSuccess(res, {
      token: newToken,
      user,
    });
  } catch (error) {
    return sendServerError(res, error, 'refresh token');
  }
};

module.exports = {
  checkEmail,
  register,
  login,
  me,
  logout,
  refresh,
};
