import { Send } from "lucide-react";
import { useMemo, useState } from "react";
import { Button, TextInput } from "./ui";
import type { MomentComment } from "../types";
import { timeAgo } from "../utils/format";

const PAGE_SIZE = 5;

/* 页码窗口：≤7 页全量，否则 1 … p-1 p p+1 … 末页 */
function pagesToShow(pageCount: number, currentPage: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const set = new Set<number>([1, pageCount]);
  for (const p of [currentPage - 1, currentPage, currentPage + 1]) {
    if (p > 1 && p < pageCount) set.add(p);
  }
  const nums = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  let prev = 0;
  for (const n of nums) {
    if (n - prev > 1) out.push("…");
    out.push(n);
    prev = n;
  }
  return out;
}

/**
 * 朋友圈式评论区 —— 状态全部由组件自己用 useState 持有，不依赖任何外部 store。
 * · 灰底扁平评论块，评论按时间正序平铺分页，无头像
 * · 点「回复」→ 内联输入框（回复 @xxx）
 * · 底部常驻内容输入框：只填内容，无需昵称 / 邮箱 / 验证码
 */
export function MomentComments({
  comments,
  me,
  open,
  onClose,
  onAdd,
  onDelete,
}: {
  comments: MomentComment[];
  me: string;
  open: boolean;
  onClose: () => void;
  onAdd: (content: string, parentId?: string) => void;
  onDelete: (commentId: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [replyTo, setReplyTo] = useState<MomentComment | null>(null);
  const [draft, setDraft] = useState("");
  const [replyDraft, setReplyDraft] = useState("");

  /* 评论按时间正序平铺（无嵌套缩进，回复用「回复 @xxx」标识） */
  const flat = useMemo(
    () => [...comments].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [comments],
  );

  const pageCount = Math.max(1, Math.ceil(flat.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = flat.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const replyName = (c: MomentComment) =>
    c.parentId ? flat.find((p) => p.id === c.parentId)?.author : undefined;

  const goLastPage = () => setPage(Math.floor(flat.length / PAGE_SIZE) + 1);

  const submitTop = () => {
    const t = draft.trim();
    if (!t) return;
    onAdd(t);
    setDraft("");
    goLastPage();
  };

  const submitReply = () => {
    const t = replyDraft.trim();
    if (!t || !replyTo) return;
    onAdd(t, replyTo.id);
    setReplyDraft("");
    setReplyTo(null);
    goLastPage();
  };

  if (!open) return null;

  return (
    <div className="mt-2.5 rounded-lg bg-raised/70 px-4 py-3">
      {paged.length === 0 ? (
        <p className="py-1 text-[13px] text-ash">还没有评论，来抢沙发～</p>
      ) : (
        <ul className="space-y-2.5">
          {paged.map((c) => (
          <li key={c.id} className="text-[13px] leading-relaxed">
            <p className="flex flex-wrap items-center gap-x-2">
              <span className="text-[#409eff]">{c.author}</span>
              {replyName(c) && (
                <span className="text-ash">
                  回复 <span className="text-[#409eff]">@{replyName(c)}</span>
                </span>
              )}
              {c.isAdmin && (
                <span className="rounded-sm bg-ember/15 px-1 py-0.5 font-display text-[10px] text-ember">
                  站长
                </span>
              )}
              <button
                type="button"
                onClick={() => onDelete(c.id)}
                className="cursor-pointer text-[11px] text-ash transition-colors hover:text-ruby"
              >
                删除
              </button>
              <span className="ml-auto text-[11px] text-ash">
                {timeAgo(c.createdAt)}
              </span>
            </p>
            <p className="mt-0.5 text-cream">{c.content}</p>

            {replyTo?.id !== c.id ? (
              <button
                type="button"
                onClick={() => {
                  setReplyTo(c);
                  setReplyDraft("");
                }}
                className="mt-1 cursor-pointer text-[11px] text-ash transition-colors hover:text-[#409eff]"
              >
                回复
              </button>
            ) : (
              <div className="fade-in mt-2 flex gap-2">
                <TextInput
                  value={replyDraft}
                  onChange={(e) => setReplyDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitReply()}
                  placeholder={`回复 @${c.author}…`}
                  aria-label="回复内容"
                  autoFocus
                />
                <Button className="shrink-0" icon={Send} onClick={submitReply}>
                  发送
                </Button>
                <Button variant="ghost" onClick={() => setReplyTo(null)}>
                  取消
                </Button>
              </div>
            )}
          </li>
        ))}
        </ul>
      )}

      {/* 分页行：共 N 页 · 页码 · 上一页/下一页 · 收起 */}
      {flat.length > PAGE_SIZE && (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ash">
          <span>
            共 <span className="tnum">{pageCount}</span> 页
          </span>

          {currentPage > 1 && (
            <button
              type="button"
              onClick={() => setPage(currentPage - 1)}
              className="cursor-pointer transition-colors hover:text-[#409eff]"
            >
              上一页
            </button>
          )}

          <span className="flex items-center gap-1">
            {pagesToShow(pageCount, currentPage).map((p, i) =>
              p === "…" ? (
                <span key={`e${i}`} className="select-none px-0.5">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => p !== currentPage && setPage(p)}
                  aria-current={p === currentPage ? "page" : undefined}
                  className={`min-w-6 cursor-pointer rounded px-1 py-0.5 text-center tabular-nums transition-colors ${
                    p === currentPage
                      ? "bg-ember/15 font-medium text-ember"
                      : "hover:text-[#409eff]"
                  }`}
                >
                  {p}
                </button>
              ),
            )}
          </span>

          {currentPage < pageCount && (
            <button
              type="button"
              onClick={() => setPage(currentPage + 1)}
              className="cursor-pointer transition-colors hover:text-[#409eff]"
            >
              下一页
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer transition-colors hover:text-[#409eff]"
          >
            收起
          </button>
        </div>
      )}

      {/* 底部评论输入框：只填内容，无需昵称 / 邮箱 / 验证码 */}
      <div className="mt-3 flex gap-2 border-t border-line pt-3">
        <TextInput
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitTop()}
          placeholder={`以 ${me} 的身份说点什么…`}
          aria-label="评论内容"
        />
        <Button className="shrink-0" icon={Send} onClick={submitTop}>
          发送
        </Button>
      </div>
    </div>
  );
}
