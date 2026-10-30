import { Empty, Image } from "antd";
import {
  Heart,
  ImagePlus,
  MapPin,
  MessageCircle,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { MomentComments } from "../components/MomentComments";
import {
  Button,
  Card,
  ConfirmDialog,
  IconButton,
  TextArea,
  TextInput,
  UserAvatar,
} from "../components/ui";
import { useStore } from "../data/hooks";
import type { Moment } from "../types";
import { gradientSrc } from "../utils/art";
import { formatCount, timeAgo } from "../utils/format";

const MAX_IMAGES = 9;

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

/* ============ 单条动态 ============ */
function MomentCard({
  moment,
  me,
  index,
  onDeleteMoment,
  onDeleteComment,
}: {
  moment: Moment;
  me: string;
  index: number;
  onDeleteMoment: (id: string) => void;
  onDeleteComment: (momentId: string, commentId: string) => void;
}) {
  const { toggleMomentLike } = useStore();
  const [open, setOpen] = useState(true);
  const liked = moment.likes.includes(me);

  return (
    <li className="reveal" style={{ animationDelay: `${Math.min(index, 6) * 0.05}s` }}>
      <Card className="transition-colors hover:border-line-strong">
        <div className="p-5">
          {/* 正文 + 删除 */}
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              {moment.content && (
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-cream">
                  {moment.content}
                </p>
              )}
            </div>
            <IconButton
              icon={Trash2}
              label="删除动态"
              danger
              onClick={() => onDeleteMoment(moment.id)}
            />
          </div>

          <div className="mt-2.5">
            <MomentImages moment={moment} />
          </div>

          {/* 元信息 + 操作行 */}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ash">
            {moment.location && (
              <span className="inline-flex items-center gap-1">
                <MapPin size={12} />
                {moment.location}
              </span>
            )}
            <span className="tnum">{timeAgo(moment.createdAt)}</span>

            <button
              type="button"
              onClick={() => toggleMomentLike(moment.id, me)}
              aria-pressed={liked}
              className={`inline-flex cursor-pointer items-center gap-1 transition-colors ${
                liked ? "text-ruby" : "hover:text-[#409eff]"
              }`}
            >
              <Heart size={13} style={{ fill: liked ? "currentColor" : "none" }} />
              <span className="tnum">{formatCount(moment.likes.length)}</span>
            </button>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={`评论 ${moment.comments.length} 条`}
              className={`inline-flex cursor-pointer items-center gap-1 transition-colors ${
                open ? "text-[#409eff]" : "hover:text-[#409eff]"
              }`}
            >
              <MessageCircle size={13} />
              <span className="tnum">{formatCount(moment.comments.length)}</span>
            </button>
          </div>

          {/* 朋友圈式评论块 */}
          <MomentComments
            moment={moment}
            me={me}
            open={open}
            onClose={() => setOpen(false)}
            onDeleteComment={(commentId) => onDeleteComment(moment.id, commentId)}
          />
        </div>
      </Card>
    </li>
  );
}

export default function Moments() {
  const {
    state,
    addMoment,
    deleteMoment,
    deleteMomentComment,
    notify,
  } = useStore();
  const me = state.settings.username?.trim() || "DAVAID";

  /* 发布区 */
  const [draft, setDraft] = useState("");
  const [place, setPlace] = useState("");
  const [pics, setPics] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  /* 删除目标：动态 或 某条评论 */
  const [toDelete, setToDelete] = useState<{
    kind: "moment" | "comment";
    momentId: string;
    commentId?: string;
  } | null>(null);

  const moments = useMemo(() => state.moments ?? [], [state.moments]);

  const stats = useMemo(() => {
    const likes = moments.reduce((s, m) => s + m.likes.length, 0);
    const comments = moments.reduce((s, m) => s + m.comments.length, 0);
    return { count: moments.length, likes, comments };
  }, [moments]);

  const pickPics = (files: FileList | null) => {
    if (!files) return;
    const room = MAX_IMAGES - pics.length;
    if (room <= 0) {
      notify(`最多只能上传 ${MAX_IMAGES} 张图片`);
      return;
    }
    Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, room)
      .forEach((f) => setPics((prev) => [...prev, URL.createObjectURL(f)]));
  };

  const publish = () => {
    if (!draft.trim() && pics.length === 0) return;
    addMoment({
      content: draft.trim(),
      images: pics,
      location: place.trim() || undefined,
    });
    setDraft("");
    setPlace("");
    setPics([]);
  };

  const canPublish = draft.trim().length > 0 || pics.length > 0;

  return (
    <div className="mx-auto max-w-205 space-y-5">
      {/* ============ 封面 ============ */}
      <Card className="reveal overflow-hidden">
        <div
          className="relative h-40 bg-linear-to-br from-[#409eff] via-[#3a7bd5] to-[#1d3557]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #409eff 0%, #2b6cb0 45%, #16243d 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle at 78% 22%, rgba(255,255,255,0.35), transparent 45%), radial-gradient(circle at 18% 82%, rgba(255,255,255,0.22), transparent 42%)",
            }}
          />
          <div className="absolute right-5 -bottom-6.5 flex items-end gap-3">
            <div className="flex items-baseline gap-2 pb-1 text-white drop-shadow">
              <span className="font-display text-[15px] font-bold">{me}</span>
            </div>
            <div className="rounded-full border-4 border-surface bg-surface">
              <UserAvatar name={me} src={state.settings.avatar} size={64} />
            </div>
          </div>
        </div>

        <div className="flex mt-2 flex-wrap items-center gap-x-6 gap-y-1 pt-5 pb-4 pl-5 pr-4">
          <p className="text-[12px] text-ash">
            {state.settings.slogan || "记录生活的每一帧"}
          </p>
          <div className="ml-auto flex items-center gap-4 text-[12px]">
            <span className="text-ash">
              动态 <b className="tnum ml-1 text-cream">{stats.count}</b>
            </span>
            <span className="text-ash">
              获赞 <b className="tnum ml-1 text-cream">{stats.likes}</b>
            </span>
            <span className="text-ash">
              评论 <b className="tnum ml-1 text-cream">{stats.comments}</b>
            </span>
          </div>
        </div>
      </Card>

      {/* ============ 发布框 ============ */}
      <Card className="reveal reveal-1">
        <div className="space-y-3 p-5">
          <TextArea
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="这一刻的想法…"
            aria-label="动态内容"
          />

          {pics.length > 0 && (
            <div className="grid grid-cols-3 mt-2 gap-2 sm:grid-cols-5">
              {pics.map((src, i) => (
                <div
                  key={src}
                  className="group relative aspect-square overflow-hidden rounded-md border border-line bg-raised"
                >
                  <img
                    src={src}
                    alt={`待发布配图 ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPics((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    aria-label={`移除第 ${i + 1} 张图片`}
                    className="absolute top-1 right-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-[12px] text-fog transition-colors hover:bg-raised hover:text-ember"
              aria-label="添加配图"
            >
              <ImagePlus size={15} /> 图片
              <span className="tnum text-ash">
                {pics.length}/{MAX_IMAGES}
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              aria-label="选择配图文件"
              onChange={(e) => {
                pickPics(e.target.files);
                e.target.value = "";
              }}
            />

            <TextInput
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="所在位置（可选）"
              aria-label="所在位置"
              className="w-44"
            />

            <div className="ml-auto flex items-center gap-2">
              <Button onClick={publish} disabled={!canPublish} icon={Sparkles}>
                发布
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* ============ 时间流 ============ */}
      {moments.length === 0 ? (
        <Card className="reveal reveal-2 border-dashed py-10">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span className="text-[13px] text-fog">
                还没有动态，发一条记录今天
              </span>
            }
          />
        </Card>
      ) : (
        <ul className="space-y-4">
          {moments.map((m, i) => (
            <MomentCard
              key={m.id}
              moment={m}
              me={me}
              index={i}
              onDeleteMoment={(id) => setToDelete({ kind: "moment", momentId: id })}
              onDeleteComment={(momentId, commentId) =>
                setToDelete({ kind: "comment", momentId, commentId })
              }
            />
          ))}
        </ul>
      )}

      {/* ============ 删除确认 ============ */}
      <ConfirmDialog
        open={toDelete !== null}
        title={toDelete?.kind === "moment" ? "删除动态" : "删除评论"}
        body={
          toDelete?.kind === "moment"
            ? "确定删除这条动态吗？点赞和评论都会一并消失，此操作不可撤销。"
            : "确定删除这条评论吗？挂在它下面的回复也会一并删除。"
        }
        confirmText="删除"
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (!toDelete) return;
          if (toDelete.kind === "moment") deleteMoment(toDelete.momentId);
          else if (toDelete.commentId)
            deleteMomentComment(toDelete.momentId, toDelete.commentId);
          setToDelete(null);
        }}
      />
    </div>
  );
}
