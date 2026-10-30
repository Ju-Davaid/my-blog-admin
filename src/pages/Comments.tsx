import { Check, CornerDownRight, MessageSquare, RotateCcw, Send, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, ConfirmDialog, EmptyState, IconButton, TextInput } from "../components/ui";
import { useStore } from "../data/hooks";
import type { CommentItem, CommentStatus } from "../types";
import { timeAgo } from "../utils/format";

const TABS: { key: CommentStatus; label: string }[] = [
  { key: "pending", label: "待审核" },
  { key: "approved", label: "已通过" },
  { key: "spam", label: "垃圾" },
];

function Avatar({ c, small = false }: { c: CommentItem; small?: boolean }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-bold ${
        small ? "h-7 w-7 text-[11px]" : "h-9 w-9 text-xs"
      } ${c.isAdmin ? "bg-ember text-white" : "bg-raised text-fog"}`}
      aria-hidden
    >
      {c.author.slice(0, 1).toUpperCase()}
    </span>
  );
}

function AdminBadge() {
  return (
    <span className="rounded-sm bg-ember-dim px-1.5 py-0.5 font-display text-[10px] font-bold tracking-wider text-ember uppercase">
      站长
    </span>
  );
}

export default function Comments() {
  const { state, setCommentStatus, deleteComment, addComment } = useStore();
  const [tab, setTab] = useState<CommentStatus>("pending");
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  /* 回复按 parentId 归到父评论下，孤立回复（父评论已不存在）提升为顶层 */
  const { counts, threads } = useMemo(() => {
    const ids = new Set(state.comments.map((c) => c.id));
    const repliesByParent = new Map<string, CommentItem[]>();
    const c: Record<string, number> = { pending: 0, approved: 0, spam: 0 };

    for (const cm of state.comments) {
      if (cm.parentId && ids.has(cm.parentId)) {
        const arr = repliesByParent.get(cm.parentId);
        if (arr) arr.push(cm);
        else repliesByParent.set(cm.parentId, [cm]);
      } else {
        c[cm.status]++;
      }
    }

    // 回复按时间正序，读起来像对话
    for (const arr of repliesByParent.values()) {
      arr.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    }

    const roots = state.comments.filter(
      (cm) => (!cm.parentId || !ids.has(cm.parentId)) && cm.status === tab,
    );

    return {
      counts: c,
      threads: roots.map((root) => ({ root, replies: repliesByParent.get(root.id) ?? [] })),
    };
  }, [state.comments, tab]);

  const postTitle = (id: string) => state.posts.find((p) => p.id === id)?.title ?? "（文章已删除）";

  const adminName = state.settings.username?.trim() || "DAVAID";

  const submitReply = (parent: CommentItem) => {
    const text = replyText.trim();
    if (!text) return;
    addComment({
      postId: parent.postId,
      author: adminName,
      content: text,
      status: "approved",
      isAdmin: true,
      parentId: parent.id,
    });
    setReplyText("");
    setReplyTo(null);
  };

  const toggleReply = (id: string) => {
    setReplyTo(replyTo === id ? null : id);
    setReplyText("");
  };

  return (
    <div className="space-y-5">
      {/* 标签页 */}
      <div className="reveal flex flex-wrap gap-1.5">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            aria-pressed={tab === key}
            className={`flex min-h-[38px] cursor-pointer items-center gap-2 rounded-md border px-4 text-[13px] transition-colors ${
              tab === key
                ? "border-ember bg-ember-dim font-medium text-ember"
                : "border-line text-fog hover:border-line-strong hover:text-cream"
            }`}
          >
            {label}
            <span
              className={`tnum rounded-sm px-1.5 font-display text-[11px] ${
                tab === key ? "bg-ember/20 text-ember" : "bg-overlay text-ash"
              }`}
            >
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {threads.length === 0 ? (
        <div className="reveal reveal-1">
          <EmptyState
            icon={MessageSquare}
            title={tab === "pending" ? "没有待审核评论" : tab === "approved" ? "还没有通过的评论" : "垃圾筒是空的"}
            hint={tab === "pending" ? "新评论会出现在这里，等你裁决。" : undefined}
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {threads.map(({ root, replies }, i) => (
            <li key={root.id} className="reveal" style={{ animationDelay: `${Math.min(i, 6) * 0.05}s` }}>
              <Card className="p-4 transition-colors hover:border-line-strong">
                <div className="flex items-start gap-3">
                  <Avatar c={root} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-[13px] font-bold text-cream">{root.author}</span>
                      {root.isAdmin && <AdminBadge />}
                      <span className="text-[11px] text-ash">{timeAgo(root.createdAt)}</span>
                      <span className="text-[11px] text-ash">·</span>
                      <Link
                        to={state.posts.some((p) => p.id === root.postId) ? `/posts/${root.postId}` : "/posts"}
                        className="link-sweep truncate text-[12px] text-fog hover:text-ember"
                      >
                        《{postTitle(root.postId)}》
                      </Link>
                      {replies.length > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-sm bg-overlay px-1.5 py-0.5 text-[10px] text-ash">
                          <CornerDownRight size={10} />
                          {replies.length} 条回复
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-fog">{root.content}</p>

                    {/* 操作区 */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {root.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            className="min-h-[30px] px-2.5 text-xs"
                            icon={Check}
                            onClick={() => setCommentStatus(root.id, "approved")}
                          >
                            通过
                          </Button>
                          <Button
                            variant="ghost"
                            className="min-h-[30px] px-2.5 text-xs text-gold"
                            icon={X}
                            onClick={() => setCommentStatus(root.id, "spam")}
                          >
                            垃圾
                          </Button>
                        </>
                      )}
                      {root.status === "spam" && (
                        <Button
                          variant="ghost"
                          className="min-h-[30px] px-2.5 text-xs"
                          icon={RotateCcw}
                          onClick={() => setCommentStatus(root.id, "approved")}
                        >
                          恢复
                        </Button>
                      )}
                      {root.status === "approved" && (
                        <Button
                          variant="ghost"
                          className="min-h-[30px] px-2.5 text-xs"
                          icon={Send}
                          onClick={() => toggleReply(root.id)}
                        >
                          {replyTo === root.id ? "收起回复" : "回复"}
                        </Button>
                      )}
                      <IconButton icon={Trash2} label="删除评论" danger onClick={() => setToDelete(root.id)} />
                    </div>

                    {/* 回复框 */}
                    {replyTo === root.id && (
                      <div className="fade-in mt-3 flex gap-2">
                        <TextInput
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && submitReply(root)}
                          placeholder={`以站长身份回复 ${root.author}…`}
                          aria-label="回复内容"
                          autoFocus
                        />
                        <Button className="shrink-0" icon={Send} onClick={() => submitReply(root)}>
                          发送
                        </Button>
                      </div>
                    )}

                    {/* 子回复：挂在父评论下方 */}
                    {replies.length > 0 && (
                      <ul className="mt-3 space-y-2 border-l-2 border-line pl-3 sm:pl-4">
                        {replies.map((r) => (
                          <li key={r.id} className="fade-in rounded-md bg-raised/50 p-2.5">
                            <div className="flex items-start gap-2.5">
                              <Avatar c={r} small />
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-display text-xs font-bold text-cream">{r.author}</span>
                                  {r.isAdmin && <AdminBadge />}
                                  <span className="text-[11px] text-ash">{timeAgo(r.createdAt)}</span>
                                  {r.status !== "approved" && (
                                    <span className="rounded-sm bg-gold/15 px-1.5 py-0.5 font-display text-[10px] text-gold">
                                      {r.status === "pending" ? "待审核" : "垃圾"}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-[13px] leading-relaxed text-fog">{r.content}</p>
                              </div>
                              <IconButton
                                icon={Trash2}
                                label={`删除 ${r.author} 的回复`}
                                danger
                                onClick={() => setToDelete(r.id)}
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="删除评论"
        body="确定删除这条评论吗？挂在它下面的回复会一并删除，此操作不可撤销。"
        confirmText="删除"
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deleteComment(toDelete);
          setToDelete(null);
        }}
      />
    </div>
  );
}
