export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

const storage = {
  getItem: (key: string): string | null => localStorage.getItem(key),
  setItem: (key: string, value: string): void => localStorage.setItem(key, value),
  removeItem: (key: string): void => localStorage.removeItem(key),
  clear: (): void => localStorage.clear(),
};

export const authToken = (tokenType: string): string | null => {
  const _key = `ekili-flit:${tokenType}-token`;
  return storage.getItem(_key);
};

export const setAuthToken = (tokens: { [key: string]: string | null }) => {
  for (const [key, value] of Object.entries(tokens)) {
    if (value !== null) {
      storage.setItem(`ekili-flit:${key}-token`, value);
    } else {
      storage.removeItem(`ekili-flit:${key}-token`);
    }
  }
};

export const saveUser = (user: CurrentUser) => {
  storage.setItem("ekili-flit:user", JSON.stringify(user));
};

export const currentUser = (): CurrentUser | null => {
  const user = storage.getItem("ekili-flit:user");
  return user ? JSON.parse(user) : null;
};

export const clearCache = () => {
  storage.clear();
};

export const isLoggedIn = (): boolean => {
  const user = currentUser();
  return user !== null && user.name !== null;
};
