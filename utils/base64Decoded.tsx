const base64Decoded = (encode: string) => {
  return new TextDecoder().decode(
    Uint8Array.from(atob(encode || ""), (c) => c.charCodeAt(0)),
  );
};

export default base64Decoded;
