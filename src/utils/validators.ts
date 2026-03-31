/**
 * FORGA — Fonctions de validation
 * Valide les données saisies par l'utilisateur lors de l'onboarding et ailleurs.
 */

/**
 * Valide l'âge de l'utilisateur.
 * Doit être un entier entre 14 et 120 ans.
 */
export function validateAge(age: number): boolean {
  if (!Number.isFinite(age)) return false;
  if (!Number.isInteger(age)) return false;
  return age >= 14 && age <= 120;
}

/**
 * Valide le poids de l'utilisateur (en kg).
 * Doit être un nombre entre 30 et 300 kg.
 */
export function validateWeight(weight: number): boolean {
  if (!Number.isFinite(weight)) return false;
  return weight >= 30 && weight <= 300;
}

/**
 * Valide la taille de l'utilisateur (en cm).
 * Doit être un entier entre 100 et 250 cm.
 */
export function validateHeight(height: number): boolean {
  if (!Number.isFinite(height)) return false;
  if (!Number.isInteger(height)) return false;
  return height >= 100 && height <= 250;
}

/**
 * Valide une adresse email.
 * Utilise une expression régulière conforme à la RFC 5322 simplifiée.
 */
export function validateEmail(email: string): boolean {
  if (typeof email !== 'string') return false;
  const trimmed = email.trim();
  if (trimmed.length === 0) return false;
  if (trimmed.length > 254) return false;

  // RFC 5322 simplified pattern
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(trimmed)) return false;

  // Must have at least one dot after @
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;

  const domain = parts[1];
  if (!domain.includes('.')) return false;

  // Domain extension must be at least 2 chars
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) return false;

  return true;
}
