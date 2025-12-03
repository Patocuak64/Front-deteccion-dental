// src/utils/emailValidator.js

/**
 * Valida formato y estructura de un correo electrónico
 * Reglas:
 * - Debe tener formato válido (usuario@dominio.ext)
 * - No permite múltiples puntos consecutivos (..)
 * - No permite puntos al inicio o final del usuario
 * - Dominio debe ser válido
 * - Extensión debe tener al menos 2 caracteres
 */
export function validateEmail(email) {
  // Verificar que no esté vacío
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      error: 'El correo es requerido'
    };
  }

  // Trim espacios
  email = email.trim().toLowerCase();

  // Regex básico para formato general
  const basicRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basicRegex.test(email)) {
    return {
      isValid: false,
      error: 'Formato de correo inválido'
    };
  }

  // Dividir en usuario y dominio
  const [user, domain] = email.split('@');

  // ❌ VALIDAR USUARIO (parte antes del @)
  // No puede estar vacío
  if (!user || user.length === 0) {
    return {
      isValid: false,
      error: 'La parte del usuario no puede estar vacía'
    };
  }

  // No puede tener puntos consecutivos (..)
  if (user.includes('..')) {
    return {
      isValid: false,
      error: 'El correo no puede contener puntos consecutivos (..)'
    };
  }

  // No puede empezar con punto
  if (user.startsWith('.')) {
    return {
      isValid: false,
      error: 'El correo no puede empezar con un punto'
    };
  }

  // No puede terminar con punto
  if (user.endsWith('.')) {
    return {
      isValid: false,
      error: 'El correo no puede terminar con un punto antes del @'
    };
  }

  // Debe tener al menos 1 carácter alfabético o numérico
  if (!/[a-z0-9]/.test(user)) {
    return {
      isValid: false,
      error: 'El correo debe contener al menos una letra o número'
    };
  }

  // No puede tener solo puntos
  if (user.replace(/\./g, '').length === 0) {
    return {
      isValid: false,
      error: 'El correo no puede consistir solo de puntos'
    };
  }

  // ❌ VALIDAR DOMINIO (parte después del @)
  if (!domain || domain.length === 0) {
    return {
      isValid: false,
      error: 'El dominio no puede estar vacío'
    };
  }

  // Debe tener un punto (para la extensión)
  if (!domain.includes('.')) {
    return {
      isValid: false,
      error: 'El dominio debe tener una extensión válida'
    };
  }

  // No puede tener puntos consecutivos
  if (domain.includes('..')) {
    return {
      isValid: false,
      error: 'El dominio no puede contener puntos consecutivos'
    };
  }

  // Obtener extensión (última parte después del último punto)
  const parts = domain.split('.');
  const extension = parts[parts.length - 1];

  // Extensión debe tener al menos 2 caracteres
  if (!extension || extension.length < 2) {
    return {
      isValid: false,
      error: 'La extensión del dominio debe tener al menos 2 caracteres'
    };
  }

  // Extensión debe ser solo letras
  if (!/^[a-z]+$/.test(extension)) {
    return {
      isValid: false,
      error: 'La extensión del dominio solo puede contener letras'
    };
  }

  // Nombre de dominio (antes de la extensión) no puede estar vacío
  const domainName = parts.slice(0, -1).join('.');
  if (!domainName || domainName.length === 0) {
    return {
      isValid: false,
      error: 'El nombre del dominio no puede estar vacío'
    };
  }

  // ✅ Todo bien
  return {
    isValid: true,
    error: null,
    email: email // correo normalizado (lowercase, trimmed)
  };
}

/**
 * Valida si el correo es de un dominio real conocido (opcional)
 */
export function isKnownEmailProvider(email) {
  const knownDomains = [
    'gmail.com',
    'outlook.com',
    'hotmail.com',
    'yahoo.com',
    'icloud.com',
    'protonmail.com',
    'aol.com',
    'zoho.com',
    'mail.com',
    'gmx.com',
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  return knownDomains.includes(domain);
}

/**
 * Función auxiliar para usar en inputs con validación en tiempo real
 */
export function getEmailError(email) {
  const result = validateEmail(email);
  return result.error;
}
