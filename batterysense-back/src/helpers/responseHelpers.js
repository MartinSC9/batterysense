const sendSuccess = (res, data, message = 'Operación exitosa') => {
  return res.status(200).json({ success: true, message, ...data });
};

const sendCreated = (res, data, message = 'Recurso creado exitosamente') => {
  return res.status(201).json({ success: true, message, ...data });
};

const sendValidationError = (res, message = 'Error de validación', errors = []) => {
  return res.status(400).json({ success: false, error: message, errors });
};

const sendUnauthorized = (res, message = 'No autorizado') => {
  return res.status(401).json({ success: false, error: message });
};

const sendForbidden = (res, message = 'Acceso denegado') => {
  return res.status(403).json({ success: false, error: message });
};

const sendNotFound = (res, entityName = 'Recurso') => {
  return res.status(404).json({ success: false, error: `${entityName} no encontrado` });
};

const sendServerError = (res, error, operation = 'operación') => {
  console.error(`Error en ${operation}:`, error);
  return res.status(500).json({
    success: false,
    error: `Error interno del servidor en ${operation}`
  });
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendValidationError,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendServerError,
};
