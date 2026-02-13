/**
 * End-to-End Encryption module using Web Crypto API
 * Uses ECDH for key exchange + AES-GCM for message encryption
 * 
 * Private keys are stored in localStorage (device-bound).
 * Public keys are stored in the database for key exchange.
 */

const PRIVATE_KEY_STORAGE_PREFIX = "e2e_private_key_";
const KEY_PARAMS: EcKeyGenParams = { name: "ECDH", namedCurve: "P-256" };

// --- Key Management ---

export async function generateKeyPair(): Promise<{ publicKeyJwk: JsonWebKey; privateKeyJwk: JsonWebKey }> {
  const keyPair = await crypto.subtle.generateKey(KEY_PARAMS, true, ["deriveKey"]);
  const publicKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
  const privateKeyJwk = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
  return { publicKeyJwk, privateKeyJwk };
}

export function storePrivateKey(userId: string, privateKeyJwk: JsonWebKey): void {
  localStorage.setItem(PRIVATE_KEY_STORAGE_PREFIX + userId, JSON.stringify(privateKeyJwk));
}

export function getStoredPrivateKey(userId: string): JsonWebKey | null {
  const stored = localStorage.getItem(PRIVATE_KEY_STORAGE_PREFIX + userId);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function hasPrivateKey(userId: string): boolean {
  return localStorage.getItem(PRIVATE_KEY_STORAGE_PREFIX + userId) !== null;
}

// --- Key Import ---

async function importPrivateKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey("jwk", jwk, KEY_PARAMS, false, ["deriveKey"]);
}

async function importPublicKey(jwk: JsonWebKey): Promise<CryptoKey> {
  return crypto.subtle.importKey("jwk", jwk, KEY_PARAMS, false, []);
}

// --- Shared Secret Derivation ---

async function deriveSharedKey(privateKey: CryptoKey, publicKey: CryptoKey): Promise<CryptoKey> {
  return crypto.subtle.deriveKey(
    { name: "ECDH", public: publicKey },
    privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// --- Encryption / Decryption ---

export interface EncryptedPayload {
  ciphertext: string; // base64
  iv: string;         // base64
}

export async function encryptMessage(
  plaintext: string,
  senderPrivateKeyJwk: JsonWebKey,
  recipientPublicKeyJwk: JsonWebKey
): Promise<EncryptedPayload> {
  const privateKey = await importPrivateKey(senderPrivateKeyJwk);
  const publicKey = await importPublicKey(recipientPublicKeyJwk);
  const sharedKey = await deriveSharedKey(privateKey, publicKey);

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sharedKey,
    encoded
  );

  return {
    ciphertext: arrayBufferToBase64(ciphertext),
    iv: arrayBufferToBase64(iv.buffer),
  };
}

export async function decryptMessage(
  payload: EncryptedPayload,
  recipientPrivateKeyJwk: JsonWebKey,
  senderPublicKeyJwk: JsonWebKey
): Promise<string> {
  const privateKey = await importPrivateKey(recipientPrivateKeyJwk);
  const publicKey = await importPublicKey(senderPublicKeyJwk);
  const sharedKey = await deriveSharedKey(privateKey, publicKey);

  const iv = base64ToArrayBuffer(payload.iv);
  const ciphertext = base64ToArrayBuffer(payload.ciphertext);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    sharedKey,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

// --- Utility ---

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
