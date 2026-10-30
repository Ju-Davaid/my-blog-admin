import type { AppState } from "../types";

/**
 * 空种子：接入真实数据前的干净起点。
 * 所有内容数据（文章/分类/标签/评论/相册/照片/动态/流量）均为空，
 * 站点配置仅保留站点名与用户名两个真实标识，其余占位文案已清空。
 */
export const seedState: AppState = {
  version: 2,
  settings: {
    siteTitle: "DAVAID BLOG",
    slogan: "",
    description: "",
    icp: "",
    github: "",
    email: "",
    username: "DAVAID",
    avatar: "",
  },
  categories: [],
  tags: [],
  posts: [],
  comments: [],
  albums: [],
  photos: [],
  traffic: [],
  moments: [],
};
