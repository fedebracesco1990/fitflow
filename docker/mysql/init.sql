-- Script de inicialización de base de datos
USE fit_flow_db;

-- Deshabilitar verificaciones de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Eliminar tabla si existe (para desarrollo)
DROP TABLE IF EXISTS users;

-- Crear tabla de usuarios
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY COMMENT 'UUID del usuario',
  first_name VARCHAR(100) NOT NULL COMMENT 'Nombre del usuario',
  last_name VARCHAR(100) NOT NULL COMMENT 'Apellido del usuario',
  email VARCHAR(255) NOT NULL UNIQUE COMMENT 'Email único del usuario',
  password VARCHAR(255) NOT NULL COMMENT 'Contraseña hasheada',
  is_active BOOLEAN DEFAULT TRUE COMMENT 'Usuario activo o inactivo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
  INDEX idx_email (email),
  INDEX idx_active (is_active),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB 
  DEFAULT CHARSET=utf8mb4 
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Tabla de usuarios del sistema';

-- Habilitar verificaciones de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Datos de ejemplo (opcional - comentar en producción)
INSERT INTO users (id, first_name, last_name, email, password, is_active) VALUES
  (UUID(), 'Admin', 'User', 'admin@example.com', '$2b$10$YourHashedPasswordHere', TRUE),
  (UUID(), 'Test', 'User', 'test@example.com', '$2b$10$YourHashedPasswordHere', TRUE),
  (UUID(), 'Demo', 'User', 'demo@example.com', '$2b$10$YourHashedPasswordHere', FALSE);

-- Verificar que los datos se insertaron correctamente
SELECT COUNT(*) AS total_users FROM users;
SELECT * FROM users ORDER BY created_at DESC;