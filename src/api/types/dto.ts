// 登录
export interface LoginDTO {
  username: string;
  password: string;
  captchaKey: string;
  captcha: string;
}

// 获取验证码
export interface CaptchaDTO {
  width?: number;
  height?: number;
}

// 刷新验证码
export interface RefreshCaptchaDTO extends CaptchaDTO {
  captchaKey: string;
}
