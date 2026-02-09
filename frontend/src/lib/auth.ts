export const AUTH_STORAGE_KEY = 'refreshToken';

export const saveRefreshToken = (token: string) => {
  localStorage.setItem(AUTH_STORAGE_KEY, token);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(AUTH_STORAGE_KEY);
};

export const clearRefreshToken = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};
