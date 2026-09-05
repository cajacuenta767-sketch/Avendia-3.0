/**
 * Validador estricto de textos pedagógicos.
 * Evita el ingreso de mashing de teclado, caracteres repetidos o incoherencias.
 * 
 * ponytail: Utiliza funciones nativas de TypeScript/JavaScript y expresiones regulares optimizadas.
 */
export function validatePedagogicalText(text: string): { isValid: boolean; message?: string } {
  if (!text) {
    return { isValid: false, message: "El campo no puede estar vacío." };
  }

  // Regla 1: Longitud mínima (15 caracteres reales)
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length < 15) {
    return { isValid: false, message: "El texto debe tener al menos 15 caracteres." };
  }

  // Regla 5: No solo números, espacios o signos de puntuación (debe tener letras)
  const hasLetters = /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/.test(normalized);
  if (!hasLetters) {
    return { isValid: false, message: "El texto debe incluir letras y no solo números o símbolos." };
  }

  // Regla 3: Anti-repetición de caracteres consecutivamente más de 4 veces (ej. aaaaa, ....., xxxxx)
  if (/(.)\1{4,}/.test(normalized)) {
    return { isValid: false, message: "Evite repetir caracteres de forma consecutiva." };
  }

  // Regla 2: Anti-mashing (secuencias comunes de teclado o mashing repetitivo)
  const forbiddenPatterns = [
    /asdf/i, /qwer/i, /zxcv/i, /1234/, /qaz/i, /wsx/i, /edc/i, /rfv/i,
    /asd/i, /qwe/i, /zxc/i, /123/, /yuiop/i, /hjkl/i, /bnm/i,
    /(asd){2,}/i, /(qwe){2,}/i, /(zxc){2,}/i, /(123){2,}/
  ];
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(normalized)) {
      return { isValid: false, message: "Evite el uso de patrones de teclado incoherentes." };
    }
  }

  // Regla 4: Coherencia lingüística (cluster de consonantes sin vocales, ej: rtfghs)
  const words = normalized.split(/\s+/);
  const consonantsWithoutVowelsRegex = /[bcdfghjklmnñpqrstvwxyz]{6,}/i;
  for (const word of words) {
    if (consonantsWithoutVowelsRegex.test(word)) {
      return { isValid: false, message: "El texto contiene palabras incoherentes (consonantes sin vocales)." };
    }
  }

  return { isValid: true };
}
