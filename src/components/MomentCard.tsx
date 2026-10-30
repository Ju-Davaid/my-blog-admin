import { Image } from "antd";
import { Heart, MapPin, MessageCircle, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import type { Moment } from "../types";
import { gradientSrc } from "../utils/art";
import { formatCount, timeAgo } from "../utils/format";
import { MomentComments } from "./MomentComments";
import { Card, IconButton } from "./ui";

/* 图片统一铺满父容器（antd Image 外层是 .ant-image） */
const TILE_CLASS_NAMES = { root: "photo-tile", image: "photo-tile-img" };
const TILE_STYLES = {
  root: {
    position: "absolute",
    inset: 0,
    display: "block",
    width: "100%",
    height: "100%",
  } as const,
  image: { width: "100%", height: "100%", objectFit: "cover" } as const,
};

/* 九宫格：1 张单图大样，2/4 张两列，其余三列 */
function gridClass(n: number) {
  if (n === 1) return "";
  if (n === 2) return "grid grid-cols-2 gap-1.5 max-w-[280px]";
  if (n === 4) return "grid grid-cols-2 gap-1.5 max-w-[360px]";
  return "grid grid-cols-3 gap-1.5 max-w-[420px]";
}

function MomentImages({ moment }: { moment: Moment }) {
  const images = moment.images;
  if (images.length === 0) return null;

  return (
    <Image.PreviewGroup>
      <div className={gridClass(images.length)}>
        {images.map((src, i) => (
          <div
            key={`${moment.id}-img-${i}`}
            className={
              images.length === 1
                ? "relative max-w-[320px] aspect-4/3 overflow-hidden rounded-lg border border-line bg-raised"
                : "relative aspect-square overflow-hidden rounded-md border border-line bg-raised"
            }
          >
            <Image
              src={src}
              alt={`${moment.content.slice(0, 12)} 配图 ${i + 1}`}
              loading="lazy"
              decoding="async"
              placeholder={<span className="photo-skeleton" />}
              /* objectURL 会话失效后回退到渐变图，避免出现破图 */
              fallback={gradientSrc(`${moment.id}-${i}`)}
              classNames={TILE_CLASS_NAMES}
              styles={TILE_STYLES}
            />
          </div>
        ))}
      </div>
    </Image.PreviewGroup>
  );
}

/**
 * 单条动态卡片 —— 朋友圈版式。
 * 组件自带 useState 管理「评论区展开」，点赞/评论/删除通过回调交给页面。
 */
export function MomentCard({
  moment,
  me,
  index = 0,
  onToggleLike,
  onAddComment,
  onDeleteMoment,
  onDeleteComment,
}: {
  moment: Moment;
  me: string;
  index?: number;
  onToggleLike: (momentId: string) => void;
  onAddComment: (momentId: string, content: string, parentId?: string) => void;
  onDeleteMoment: (momentId: string) => void;
  onDeleteComment: (momentId: string, commentId: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const liked = useMemo(() => moment.likes.includes(me), [moment.likes, me]);
  const likeCount = moment.likes.length;
  const commentCount = moment.comments.length;

  return (
    <Card className={`reveal reveal-${Math.min(index, 3)} px-5 py-4`}>
      <div className="flex gap-3">
        {/* 头像占位：动态作者统一用站长的首字母头像 */}
        <div className="mt-0.5 shrink-0">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-md bg-[#409eff] font-display text-[16px] font-bold text-white"
            aria-hidden
          >
            {me.slice(0, 1).toUpperCase()}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          {/* 作者名（朋友圈蓝色署名） */}
          <p className="font-display text-[13px] font-bold text-[#409eff]">
            {me}
          </p>

          {/* 正文 */}
          <p className="mt-0.5 whitespace-pre-wrap break-words text-[13.5px] leading-relaxed text-cream">
            {moment.content}
          </p>

          {moment.content && moment.images.length > 0 && <div className="h-2" />}
          <MomentImages moment={moment} />

          {/* 元信息行 */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ash">
            <span className="tnum">{timeAgo(moment.createdAt)}</span>

            {moment.location && (
              <span className="inline-flex items-center gap-1 text-[#409eff]">
                <MapPin size={12} /> {moment.location}
              </span>
            )}

            <IconButton
              icon={Trash2}
              label="删除动态"
              danger
              className="-ml-1"
              onClick={() => onDeleteMoment(moment.id)}
            />

            <div className="ml-auto flex items-center gap-1">
              {/* 点赞 */}
              <button
                type="button"
                onClick={() => onToggleLike(moment.id)}
                aria-pressed={liked}
                aria-label={liked ? "取消点赞" : "点赞"}
                className={`flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 transition-colors ${
                  liked ? "text-ruby" : "text-ash hover:text-ruby"
                }`}
              >
                <Heart size={14} fill={liked ? "currentColor" : "none"} />
                <span className="tnum">{likeCount > 0 ? formatCount(likeCount) : "赞"}</span>
              </button>

              {/* 评论 */}
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                aria-label="评论"
                className={`flex cursor-pointer items-center gap-1 rounded px-1.5 py-0.5 transition-colors ${
                  open ? "text-[#409eff]" : "text-ash hover:text-[#409eff]"
                }`}
              >
                <MessageCircle size={14} />
                <span className="tnum">
                  {commentCount > 0 ? formatCount(commentCount) : "评论"}
                </span>
              </button>
            </div>
          </div>

          {/* 评论区（自带分页与内联回复） */}
          <MomentComments
            comments={moment.comments}
            me={me}
            open={open}
            onClose={() => setOpen(false)}
            onAdd={(content, parentId) => onAddComment(moment.id, content, parentId)}
            onDelete={(commentId) => onDeleteComment(moment.id, commentId)}
          />
        </div>
      </div>
    </Card>
  );
}
