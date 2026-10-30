export enum TokenKey {
  ACCESS_TOKEN = "access_token",
  REFRESH_TOKEN = "refresh_token",
}

/** 获取 access_token */
export const getAccessToken = () => localStorage.getItem(TokenKey.ACCESS_TOKEN);
/** 获取 refresh_token */
export const getRefreshToken = () =>
  localStorage.getItem(TokenKey.REFRESH_TOKEN);

/** 设置 access_token 和 refresh_token */
export const setTokens = ({
  accessToken,
  refreshToken,
}: {
  accessToken?: string;
  refreshToken?: string;
}) => {
  if (accessToken) localStorage.setItem(TokenKey.ACCESS_TOKEN, accessToken);
  if (refreshToken) localStorage.setItem(TokenKey.REFRESH_TOKEN, refreshToken);
};

/** 清除 access_token 和 refresh_token */
export const clearTokens = () => {
  localStorage.removeItem(TokenKey.ACCESS_TOKEN);
  localStorage.removeItem(TokenKey.REFRESH_TOKEN);
};
