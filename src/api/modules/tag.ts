import type { CreateTagDTO } from "../types/dto";
import type { ResposneVO, TagVO } from "../types/vo";
import request from "./request";

export const getTagList = () => request.get<ResposneVO<TagVO[]>>("/tag/list");

export const addTag = (data: CreateTagDTO) =>
  request.post<ResposneVO<TagVO>>("/tag/create", data);
