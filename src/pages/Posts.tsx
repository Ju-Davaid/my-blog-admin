import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, Pagination, Select, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Button, Card, ConfirmDialog, EmptyState } from "../components/ui";
import { useStore } from "../data/hooks";
import { formatNumber, timeAgo } from "../utils/format";
import type { Post } from "../types";
import DefaultCover from "../assets/images/default-cover.jpg";

type StatusFilter = "all" | "published" | "draft";

export default function Posts() {
  const { state, deletePost } = useStore();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<"updated" | "views">("updated");
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const commentCount = useMemo(() => {
    const map: Record<string, number> = {};
    for (const c of state.comments) {
      if (c.status !== "spam") map[c.postId] = (map[c.postId] ?? 0) + 1;
    }
    return map;
  }, [state.comments]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    return state.posts
      .filter((p) => (status === "all" ? true : p.status === status))
      .filter((p) => (cat === "all" ? true : p.categoryId === cat))
      .filter((p) =>
        kw
          ? p.title.toLowerCase().includes(kw) ||
            p.excerpt.toLowerCase().includes(kw) ||
            p.slug.toLowerCase().includes(kw)
          : true,
      )
      .sort((a, b) =>
        sort === "views"
          ? b.views - a.views
          : b.updatedAt.localeCompare(a.updatedAt),
      );
  }, [state.posts, q, cat, status, sort]);

  const tagName = (id: string) => state.tags.find((t) => t.id === id)?.name;

  /* 分页：筛选/排序变化时回到第 1 页 */
  const resetPage = () => setPage(1);
  /* 删除导致总页数减少时，渲染期直接回收页码（不写 state） */
  const safePage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / pageSize)),
  );
  const paged = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize],
  );

  const columns: ColumnsType<Post> = [
    {
      title: "封面",
      key: "cover",
      width: 72,
      render: (_, p) => (
        <img
          src={p.cover ?? DefaultCover}
          alt=""
          className="h-10 w-14 rounded-md object-cover"
        />
      ),
    },
    {
      title: "标题",
      key: "title",
      render: (_, p) => (
        <div className="min-w-0">
          <Link
            to={`/posts/${p.id}`}
            className="flex items-center gap-2 font-medium text-cream transition-colors hover:text-ember"
          >
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${p.status === "published" ? "bg-moss" : "bg-gold"}`}
              title={p.status === "published" ? "已发布" : "草稿"}
            />
            <span className="truncate">{p.title}</span>
          </Link>
          <div className="mt-0.5 truncate pl-4 font-display text-[11px] text-ash">
            /{p.slug}
          </div>
        </div>
      ),
    },
    {
      title: "分类",
      key: "category",
      width: 100,
      render: (_, p) => (
        <Tag variant="filled" color="#8f959e" style={{ margin: 0 }}>
          {state.categories.find((c) => c.id === p.categoryId)?.name ??
            "未分类"}
        </Tag>
      ),
    },
    {
      title: "标签",
      key: "tags",
      width: 160,
      render: (_, p) => (
        <div className="flex flex-wrap gap-1">
          {p.tagIds.slice(0, 2).map((t) => (
            <Tag
              key={t}
              variant="filled"
              color="#409eff"
              style={{ margin: 0, fontSize: 12 }}
            >
              {tagName(t)}
            </Tag>
          ))}
          {p.tagIds.length > 2 && (
            <span className="font-display text-[10px] text-ash">
              +{p.tagIds.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "浏览",
      key: "views",
      width: 90,
      align: "right",
      render: (_, p) => (
        <span className="tnum font-display text-[12px] text-fog">
          {formatNumber(p.views)}
        </span>
      ),
    },
    {
      title: "评论",
      key: "comments",
      width: 70,
      align: "right",
      render: (_, p) => (
        <span className="tnum font-display text-[12px] text-fog">
          {commentCount[p.id] ?? 0}
        </span>
      ),
    },
    {
      title: "更新",
      key: "updated",
      width: 100,
      render: (_, p) => (
        <span className="text-[12px] whitespace-nowrap text-ash">
          {timeAgo(p.updatedAt)}
        </span>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 80,
      align: "right",
      render: (_, p) => (
        <div className="flex justify-end gap-0.5">
          <button
            aria-label="编辑"
            onClick={() => navigate(`/posts/${p.id}`)}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ash transition-colors hover:bg-raised hover:text-ember"
          >
            <Pencil size={14} strokeWidth={2} />
          </button>
          <button
            aria-label="删除"
            onClick={() => setToDelete(p.id)}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ash transition-colors hover:bg-ruby/10 hover:text-ruby"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* 顶部统计与新建 */}
      <div className="reveal flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold text-cream">文章</span>
          <span className="font-display text-[12px] text-ash">
            共{" "}
            <span className="tnum font-medium text-fog">{filtered.length}</span>{" "}
            篇
            {filtered.length !== state.posts.length && (
              <span className="ml-1 text-ash">/ 全部 {state.posts.length}</span>
            )}
          </span>
        </div>
        <Button icon={Plus} onClick={() => navigate("/posts/new")}>
          新建文章
        </Button>
      </div>

      {/* 筛选栏（antd 组件） */}
      <Card className="reveal reveal-1 flex flex-wrap items-center gap-2.5 p-3">
        <Input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            resetPage();
          }}
          placeholder="搜索标题 / 摘要 / slug…"
          allowClear
          style={{ flex: 1, minWidth: 220 }}
          aria-label="搜索文章"
        />
        <Select
          value={cat}
          onChange={(v) => {
            setCat(v);
            resetPage();
          }}
          aria-label="按分类筛选"
          style={{ width: 144 }}
          options={[
            { value: "all", label: "全部分类" },
            ...state.categories.map((c) => ({ value: c.id, label: c.name })),
          ]}
        />
        <Select
          value={status}
          onChange={(v) => {
            setStatus(v as StatusFilter);
            resetPage();
          }}
          aria-label="按状态筛选"
          style={{ width: 128 }}
          options={[
            { value: "all", label: "全部状态" },
            { value: "published", label: "已发布" },
            { value: "draft", label: "草稿" },
          ]}
        />
        <Select
          value={sort}
          onChange={(v) => {
            setSort(v as "updated" | "views");
            resetPage();
          }}
          aria-label="排序方式"
          style={{ width: 144 }}
          options={[
            { value: "updated", label: "按更新时间" },
            { value: "views", label: "按浏览量" },
          ]}
        />
      </Card>

      {/* 表格（antd Table） */}
      {filtered.length === 0 ? (
        <div className="reveal reveal-2">
          <EmptyState
            icon={FileText}
            title="没有匹配的文章"
            hint={q ? "换个关键词试试。" : "点击右上角「新建文章」开始第一篇。"}
          />
        </div>
      ) : (
        <div className="reveal reveal-2">
          <Table<Post>
            columns={columns}
            dataSource={paged}
            rowKey="id"
            pagination={false}
            size="middle"
            className="overflow-hidden rounded-lg border border-line bg-surface card-shadow"
          />
          {/* 分页（antd Pagination） */}
          <div className="mt-3 flex items-center justify-between rounded-lg border border-line bg-surface px-4 py-2.5 card-shadow">
            <span className="font-display text-[11px] text-ash">
              显示{" "}
              <span className="tnum text-fog">
                {(safePage - 1) * pageSize + 1}–
                {Math.min(safePage * pageSize, filtered.length)}
              </span>{" "}
              / 共 <span className="tnum text-fog">{filtered.length}</span>{" "}
              条记录
            </span>
            <Pagination
              current={safePage}
              pageSize={pageSize}
              total={filtered.length}
              showSizeChanger
              showQuickJumper
              pageSizeOptions={[5, 10, 20, 50]}
              size="small"
              onChange={(p, ps) => {
                setPage(p);
                if (ps !== pageSize) {
                  setPageSize(ps);
                  setPage(1);
                }
              }}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="删除文章"
        body={`确定删除《${state.posts.find((p) => p.id === toDelete)?.title ?? ""}》吗？相关评论会一并删除，此操作不可撤销。`}
        confirmText="删除"
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) deletePost(toDelete);
          setToDelete(null);
        }}
      />
    </div>
  );
}
