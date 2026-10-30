import { Check, MessageSquare, RotateCcw, Send, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, ConfirmDialog, EmptyState, IconButton, TextInput } from "../components/ui";
import { useStore } from "../data/hooks";
import type { CommentItem, CommentStatus } from "../types";
import { timeAgo } from "../utils/format";

const TABS: { key: CommentStatus | "all"; label: string }[] = [
  { key: "pending", label: "待审核" },
  { key: "approved", label: "已通过" },
  { key: "spam", label: "垃圾" },
];

export default function Comments() {
  const { state, setCommentStatus, deleteComment, addComment } = useStore();
  const [tab, setTab] = useState<CommentStatus>("pending");
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const counts = useMemo(() => {
    const c: Record<string, number> = { pending: 0, approved: 0, spam: 0 };
    for (const cm of state.comments) c[cm.status]++;
    return c;
  }, [state.comments]);

  const list = state.comments.filter((c) => c.status === tab);

  const postTitle = (id: string) => state.posts.find((p) => p.id === id)?.title ?? "（文章已删除）";

  const submitReply = (parent: CommentItem) => {
    const text = replyText.trim();
    if (!text) return;
    addComment({
      postId: parent.postId,
      author: "DAVAID",
      content: text,
      status: "approved",
      isAdmin: true,
    });
    setReplyText("");
    setReplyTo(null);
  };

  return (
    <div className="space-y-5">
      {/* 标签页 */}
      <div className="reveal flex flex-wrap gap-1.5">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key as CommentStatus)}
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

      {list.length === 0 ? (
        <div className="reveal reveal-1">
          <EmptyState
            icon={MessageSquare}
            title={tab === "pending" ? "没有待审核评论" : tab === "approved" ? "还没有通过的评论" : "垃圾筒是空的"}
            hint={tab === "pending" ? "新评论会出现在这里，等你裁决。" : undefined}
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {list.map((c, i) => (
            <li
              key={c.id}
              className="reveal"
              style={{ animationDelay: `${Math.min(i, 6) * 0.05}s` }}
            >
              <Card className="p-4 transition-colors hover:border-line-strong">
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold ${
                      c.isAdmin ? "bg-ember text-white" : "bg-raised text-fog"
                    }`}
                  >
                    {c.author.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display text-[13px] font-bold text-cream">{c.author}</span>
                      {c.isAdmin && (
                        <span className="rounded-sm bg-ember-dim px-1.5 py-0.5 font-display text-[10px] font-bold tracking-wider text-ember uppercase">
                          站长
                        </span>
                      )}
                      <span className="text-[11px] text-ash">{timeAgo(c.createdAt)}</span>
                      <span className="text-[11px] text-ash">·</span>
                      <Link
                        to={state.posts.some((p) => p.id === c.postId) ? `/posts/${c.postId}` : "/posts"}
                        className="link-sweep truncate text-[12px] text-fog hover:text-ember"
                      >
                        《{postTitle(c.postId)}》
                      </Link>
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-fog">{c.content}</p>

                    {/* 操作区 */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {c.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            className="min-h-[30px] px-2.5 text-xs"
                            icon={Check}
                            onClick={() => setCommentStatus(c.id, "approved")}
                          >
                            通过
                          </Button>
                          <Button
                            variant="ghost"
                            className="min-h-[30px] px-2.5 text-xs text-gold"
                            icon={X}
                            onClick={() => setCommentStatus(c.id, "spam")}
                          >
                            垃圾
                          </Button>
                        </>
                      )}
                      {c.status === "spam" && (
                        <Button
                          variant="ghost"
                          className="min-h-[30px] px-2.5 text-xs"
                          icon={RotateCcw}
                          onClick={() => setCommentStatus(c.id, "approved")}
                        >
                          恢复
                        </Button>
                      )}
                      {c.status === "approved" && !c.isAdmin && (
                        <Button
                          variant="ghost"
                          className="min-h-[30px] px-2.5 text-xs"
                          icon={Send}
                          onClick={() => {
                            setReplyTo(replyTo === c.id ? null : c.id);
                            setReplyText("");
                          }}
                        >
                          {replyTo === c.id ? "收起回复" : "回复"}
                        </Button>
                      )}
                      <IconButton icon={Trash2} label="删除评论" danger onClick={() => setToDelete(c.id)} />
                    </div>

                    {/* 回复框 */}
                    {replyTo === c.id && (
                      <div className="fade-in mt-3 flex gap-2">
                        <TextInput
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && submitReply(c)}
                          placeholder={`以站长身份回复 ${c.author}…`}
                          aria-label="回复内容"
                          autoFocus
                        />
                        <Button className="shrink-0" icon={Send} onClick={() => submitReply(c)}>
                          发送
                        </Button>
                      </div>
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
        body="确定删除这条评论吗？此操作不可撤销。"
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
