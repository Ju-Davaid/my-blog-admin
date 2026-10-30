import axios from "axios";
import {
  getAccessToken,
  getRefreshToken,
  clearTokens,
  setTokens,
} from "@/utils/token";

const request = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

const refreshClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
});

request.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;

type PendingQueueItem = {
  resolve: (token: any) => void;
  reject: (error: any) => void;
};
const pendingQueue: PendingQueueItem[] = [];

// 刷新结束后，唤醒队列里的请求（成功则带新 token 重试，失败则全部 reject）
const flushQueue = (error: any, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  pendingQueue.splice(0, pendingQueue.length);
};

const doRefresh = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("NO_REFRESH_TOKEN");

  const { data } = await refreshClient.post("/auth/refresh", { refreshToken });
  // 按后端实际返回结构调整
  setTokens(data);
  return data.accessToken;
};

const redirectToLogin = () => {
  clearTokens();
  if (!location.pathname.startsWith("/login")) {
    location.replace("/login");
  }
};

request.interceptors.response.use(
  (response) => response.data,

  async (error) => {
    const { response, config } = error;

    // 非 401 / 拿不到 config：直接抛
    if (!response || response.status !== 401 || !config) {
      return Promise.reject(error);
    }

    // 刷新接口自己 401：直接登出，防止死循环
    if (config.url?.includes("/auth/refresh")) {
      redirectToLogin();
      return Promise.reject(error);
    }

    // 已经重试过还 401：不再重试
    if (config._retry) {
      return Promise.reject(error);
    }
    config._retry = true;

    // 已有请求在刷新 → 排队等待
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token: string) => {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
            resolve(request(config));
          },
          reject,
        });
      });
    }

    // 第一个 401 的请求负责刷新
    isRefreshing = true;
    try {
      const newToken = await doRefresh();
      flushQueue(null, newToken);

      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${newToken}`;
      return request(config);
    } catch (refreshError) {
      flushQueue(refreshError);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default request;
