import { TokenKey } from "@/enum";

/** 获取 access_token */
export const getAccessToken = () => localStorage.getItem(TokenKey.ACCESS_TOKEN);
/** 获取 refresh_token */
export const getRefreshToken = () =>
  localStorage.getItem(TokenKey.REFRESH_TOKEN);

interface SetTokensProps {
  accessToken?: string;
  refreshToken?: string;
  userInfo?: {
    username: string;
    role: number | number[];
  };
}

/** 设置 access_token 和 refresh_token */
export const setTokens = ({
  accessToken,
  refreshToken,
  userInfo,
}: SetTokensProps) => {
  if (accessToken) localStorage.setItem(TokenKey.ACCESS_TOKEN, accessToken);
  if (refreshToken) localStorage.setItem(TokenKey.REFRESH_TOKEN, refreshToken);
  if (userInfo)
    localStorage.setItem(TokenKey.USER_INFO, JSON.stringify(userInfo));
};

/** 清除 access_token 和 refresh_token */
export const clearTokens = () => {
  localStorage.removeItem(TokenKey.ACCESS_TOKEN);
  localStorage.removeItem(TokenKey.REFRESH_TOKEN);
};
