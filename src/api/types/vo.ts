export interface ResposneVO<T> {
  code: number;
  msg: string;
  data: T;
}

export interface CaptchaVO {
  captchaKey: string;
  captchaImg: string;
}

export interface LoginVO {
  username: string;
  role: number | number[];
  accessToken: string;
  refreshToken: string;
}
