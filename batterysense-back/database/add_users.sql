-- =============================================
-- Script para agregar usuarios de prueba
-- Ejecutar en MySQL Workbench
-- Password para todos: Admin123!
-- =============================================

USE batterysense;

-- Usuario Técnico (si no existe)
INSERT IGNORE INTO users (email, password_hash, username, role, first_name, last_name, is_active)
VALUES (
    'tecnico@batterysense.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'tecnico',
    'tecnico',
    'Técnico',
    'TRISO',
    1
);

-- Usuario Cliente (si no existe)
INSERT IGNORE INTO users (email, password_hash, username, role, first_name, last_name, is_active)
VALUES (
    'cliente@empresa.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'cliente',
    'cliente',
    'Juan',
    'Pérez',
    1
);

-- Verificar usuarios creados
SELECT id, email, username, role, is_active FROM users;
