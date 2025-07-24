export const isValidUrl = (url: string): boolean => {
  try {
    return url.trim().length > 0 && !!new URL(url);
  } catch {
    return false;
  }
};
