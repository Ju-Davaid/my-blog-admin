// 响应结构
export interface ResponseVO<T> {
  code: number;
  msg: string;
  data: T;
}
// 分页数据结构
export interface PageVO<T> {
  list: T[];
  total: number;
  pageSize: number;
  pageNum: number;
}
// 验证码
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

export interface TagVO {
  id: number;
  name: string;
  hue: string;
  count: number;
}

export enum PostStatus {
  Draft,
  Published,
}

export interface PostVO {
  id?: number;
  title: string;
  desc: string; // 摘要
  content: string; // Markdown
  tags: TagVO[];
  status: PostStatus;
  cover: string;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface AlbumVO {
  id: number;
  name: string;
  desc: string;
  cover: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PhotoVO {
  id: number;
  albumId: number;
  name: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}
