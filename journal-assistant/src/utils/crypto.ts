/**
 * Simple symmetric encryption helper using XOR and Base64 encoding.
 * Secure enough to prevent plain-text exposure in browser local storage dumps,
 * using the researcher's session passcode hash as the decryption secret.
 */
export function encryptData(text: string, secret: string): string {
  if (!text) return "";
  const key = secret || "scholar_agentic_fallback_secret_salt_123";
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
}

export function decryptData(cipher: string, secret: string): string {
  if (!cipher) return "";
  const key = secret || "scholar_agentic_fallback_secret_salt_123";
  try {
    const raw = atob(cipher);
    let result = "";
    for (let i = 0; i < raw.length; i++) {
      const charCode = raw.charCodeAt(i) ^ key.charCodeAt(i % key.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (e) {
    console.error("[Decryption Error] Failed to decrypt configuration value", e);
    return "";
  }
}
