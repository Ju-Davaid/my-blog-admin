import { App, Empty } from "antd";
import { ImagePlus, MapPin, Sparkles, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { MomentCard } from "../components/MomentCard";
import {
  Button,
  Card,
  ConfirmDialog,
  TextArea,
  TextInput,
  UserAvatar,
} from "../components/ui";
import { seedState } from "../data/seed";
import type { Moment } from "../types";

const MAX_IMAGES = 9;

export default function Moments() {
  const { message } = App.useApp();

  /* 页面自身状态：接真实数据时把这里的初值换成接口拉取 */
  const [moments, setMoments] = useState<Moment[]>([]);
  const [me] = useState(seedState.settings.username || "DAVAID");
  const [avatar] = useState<string | undefined>(undefined);
  const [slogan] = useState(seedState.settings.slogan || "记录生活的每一帧");

  /* 发布区 */
  const [draft, setDraft] = useState("");
  const [place, setPlace] = useState("");
  const [pics, setPics] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  /* 删除目标：动态 或 某条评论 */
  const [toDelete, setToDelete] = useState<
    { kind: "moment" | "comment"; momentId: string; commentId?: string } | null
  >(null);

  const stats = useMemo(
    () => ({
      count: moments.length,
      likes: moments.reduce((s, m) => s + m.likes.length, 0),
      comments: moments.reduce((s, m) => s + m.comments.length, 0),
    }),
    [moments],
  );

  const pickPics = (files: FileList | null) => {
    if (!files) return;
    const room = MAX_IMAGES - pics.length;
    if (room <= 0) {
      message.warning(`最多只能上传 ${MAX_IMAGES} 张图片`);
      return;
    }
    Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, room)
      .forEach((f) => setPics((prev) => [...prev, URL.createObjectURL(f)]));
  };

  const publish = () => {
    if (!draft.trim() && pics.length === 0) return;
    setMoments((prev) => [
      {
        id: `mo-${Date.now().toString(36)}`,
        content: draft.trim(),
        images: pics,
        createdAt: new Date().toISOString(),
        likes: [],
        comments: [],
        location: place.trim() || undefined,
      },
      ...prev,
    ]);
    message.success("动态已发布");
    setDraft("");
    setPlace("");
    setPics([]);
  };

  const toggleLike = (id: string) => {
    setMoments((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              likes: m.likes.includes(me)
                ? m.likes.filter((u) => u !== me)
                : [...m.likes, me],
            }
          : m,
      ),
    );
  };

  const addComment = (id: string, content: string, parentId?: string) => {
    setMoments((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,
              comments: [
                ...m.comments,
                {
                  id: `mc-${Date.now().toString(36)}`,
                author: me,
                content,
                createdAt: new Date().toISOString(),
                isAdmin: true,
                parentId,
              },
            ],
          }
          : m,
      ),
    );
  };

  const removeComment = (id: string, commentId: string) => {
    setMoments((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        // 级联删除该评论及其所有回复
        const doomed = new Set<string>([commentId]);
        let grew = true;
        while (grew) {
          grew = false;
          for (const c of m.comments) {
            if (c.parentId && doomed.has(c.parentId) && !doomed.has(c.id)) {
          doomed.add(c.id);
          grew = true;
        }
      }
    }
        return { ...m, comments: m.comments.filter((c) => !doomed.has(c.id)) };
      }),
    );
  };

  const canPublish = draft.trim().length > 0 || pics.length > 0;

  return (
    <div className="mx-auto max-w-205 space-y-5">
      {/* ============ 封面 ============ */}
      <Card className="reveal overflow-hidden">
        <div className="relative h-40">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #409eff 0%, #2b6cb0 45%, #16243d 100%)",
            }}
          />
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
              <UserAvatar name={me} src={avatar} size={64} />
            </div>
          </div>
        </div>

        <div className="flex mt-2 flex-wrap items-center gap-x-6 gap-y-1 pt-5 pb-4 pl-5 pr-4">
          <p className="text-[12px] text-ash">{slogan}</p>
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
                    aria-label={`移除第 ${i + 1} 张图片`
                }
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
              prefix={<MapPin size={13} className="text-ash" />}
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
        <div className="space-y-4">
          {moments.map((m, i) => (
            <MomentCard
              key={m.id}
              moment={m}
              me={me}
              index={i}
              onToggleLike={toggleLike}
              onAddComment={addComment}
              onDeleteMoment={(id) =>
                setToDelete({ kind: "moment", momentId: id })
              }
              onDeleteComment={(momentId, commentId) =>
                setToDelete({ kind: "comment", momentId, commentId })
              }
            />
          ))}
        </div>
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
          if (toDelete.kind === "moment") {
            setMoments((prev) => prev.filter((m) => m.id !== toDelete.momentId));
          } else if (toDelete.commentId) {
            removeComment(toDelete.momentId, toDelete.commentId);
          }
          setToDelete(null);
        }}
      />
    </div>
  );
}
