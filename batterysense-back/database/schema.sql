-- =============================================
-- BatterySense - Schema de Base de Datos
-- Ejecutar en MySQL Workbench
-- =============================================

-- Crear la base de datos
CREATE DATABASE IF NOT EXISTS batterysense
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE batterysense;

-- =============================================
-- Tabla de usuarios
-- =============================================
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100),
    role ENUM('cliente', 'tecnico', 'admin') DEFAULT 'cliente',
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar TEXT,
    is_active TINYINT(1) DEFAULT 1,
    deleted_at TIMESTAMP NULL,
    deleted_by INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- =============================================
-- Tabla de refresh tokens
-- =============================================
CREATE TABLE refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB;

-- =============================================
-- Tabla de audit logs
-- =============================================
CREATE TABLE audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    event_type VARCHAR(100) NOT NULL,
    details JSON,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_event_type (event_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB;

-- =============================================
-- Usuarios por defecto
-- Password para todos: Admin123! (cambiar en producción)
-- =============================================

-- Usuario Admin
INSERT INTO users (email, password_hash, username, role, first_name, last_name, is_active)
VALUES (
    'admin@batterysense.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Admin123!
    'admin',
    'admin',
    'Administrador',
    'BatterySense',
    1
);

-- Usuario Técnico
INSERT INTO users (email, password_hash, username, role, first_name, last_name, is_active)
VALUES (
    'tecnico@batterysense.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Admin123!
    'tecnico',
    'tecnico',
    'Técnico',
    'TRISO',
    1
);

-- Usuario Cliente
INSERT INTO users (email, password_hash, username, role, first_name, last_name, is_active)
VALUES (
    'cliente@empresa.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Admin123!
    'cliente',
    'cliente',
    'Juan',
    'Pérez',
    1
);

-- =============================================
-- Mensaje de éxito
-- =============================================
SELECT 'Base de datos BatterySense creada exitosamente!' AS mensaje;
SELECT COUNT(*) AS usuarios_creados FROM users;
