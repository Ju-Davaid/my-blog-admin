import type { ResponseVO, PostVO, PageVO } from "@/types/vo";
import request from "./request";
import type { CreateOrUpdatePostDTO } from "@/types/dto";


/**
 * 创建或更新文章
 * @param data 文章数据
 */
export const createOrUpdatePost = (data: CreateOrUpdatePostDTO) => {
  return request.post<ResponseVO<PostVO>>("/post/createOrUpdate", data);
};

/**
 * 获取文章列表
 * @param pageSize 每页数量
 * @param pageNum 页码
 */
export const getPostList = (pageSize = 10, pageNum = 1) =>
  request.get<ResponseVO<PageVO<PostVO>>>(
    `/post/list?pageSize=${pageSize}&pageNum=${pageNum}`,
  );

/**
 * 获取文章详情
 * @param id 文章id
 */
export const getPostById = (id: string) =>
  request.get<ResponseVO<PostVO>>(`/post/${id}`);

/**
 * 删除文章
 * @param id 文章id
 */
export const deletePostById = (id: number) => request.get(`/post/delete/${id}`);
