export const isValidUrl = (url: string): boolean => {
  try {
    const trimmed = url.trim();
    if (!trimmed) {
      return false;
    }
    const parsedUrl = new URL(trimmed);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};
