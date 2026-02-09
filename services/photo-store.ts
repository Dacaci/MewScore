// Simple in-memory store for photo data to avoid URL parameter limitations
let currentPhotoBase64: string | null = null;

export function setPhotoBase64(base64: string | null): void {
  currentPhotoBase64 = base64;
}

export function getPhotoBase64(): string | null {
  return currentPhotoBase64;
}

export function clearPhotoBase64(): void {
  currentPhotoBase64 = null;
}
