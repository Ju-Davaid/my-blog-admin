import type { PostVO } from "./vo";

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

export type CreateOrUpdatePostDTO = Partial<PostVO>;

// 刷新验证码
export interface RefreshCaptchaDTO extends CaptchaDTO {
  captchaKey: string;
}

// 创建标签
export interface CreateTagDTO {
  name: string;
  hue: string;
}

// 创建相册
export interface CreateAlbumDTO {
  name: string;
  desc: string;
}

// 创建照片
export interface CreatePhotoDTO {
  file: File;
  albumId: number;
}

// 创建动态
export interface CreateMommentDTO {
  content: string;
  urls: string[];
  category: string | null;
}
