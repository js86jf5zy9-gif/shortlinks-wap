// RFC 4648 §5 "base64url": the URL-safe alphabet (- and _ instead of + and /),
// so the encoded value can sit in a path segment without being split or
// mangled. Input is UTF-8 encoded first; plain btoa() throws on non-Latin-1.
// Padding is kept so strict decoders (e.g. Python's urlsafe_b64decode) work;
// '=' is a legal path character.
export const encodeBase64Url = (str) => {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_');
};

export const decodeBase64Url = (encoded) => {
  const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const binary = atob(padded);
  return new TextDecoder().decode(Uint8Array.from(binary, (c) => c.charCodeAt(0)));
};
