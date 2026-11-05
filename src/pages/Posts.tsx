import { FileText, Pencil, Plus, Trash2 } from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input, Pagination, Select, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { App } from "antd";
import { Reveal } from "../components/Reveal";
import { Button, Card, ConfirmDialog, EmptyState } from "@/components/ui";
import { formatNumber, timeAgo } from "@/utils/format";
import { PostStatus, type PageVO, type PostVO, type TagVO } from "@/types/vo";

import DefaultCover from "@/assets/images/default-cover.jpg";
import { deletePostById, getPostList } from "@/api";

type StatusFilter = 0 | 1 | 2;

export default function Posts() {
  const { message } = App.useApp();
  const navigate = useNavigate();

  /* 页面自身状态：接真实数据时把下面的初值换成接口拉取 */
  const [posts, setPosts] = useState<PageVO<PostVO>>({
    pageSize: 10,
    pageNum: 1,
    list: [],
    total: 0,
  });
  const [categories] = useState<TagVO[]>([]);

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<number>(2);
  const [status, setStatus] = useState<StatusFilter>(2);
  const [sort, setSort] = useState<"updated" | "views">("updated");
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /* 分页：筛选/排序变化时回到第 1 页 */
  const resetPage = () => setPage(1);
  /* 删除导致总页数减少时，渲染期直接回收页码（不写 state） */
  const safePage = Math.min(
    page,
    Math.max(1, Math.ceil(posts.total / pageSize)),
  );
  const paged = useMemo(
    () => posts.list.slice((safePage - 1) * pageSize, safePage * pageSize),
    [posts, safePage, pageSize],
  );

  const columns: ColumnsType<PostVO> = [
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
              className={`h-2 w-2 shrink-0 rounded-full ${p.status === PostStatus.Published ? "bg-moss" : "bg-gold"}`}
              title={p.status === PostStatus.Published ? "已发布" : "草稿"}
            />
            <span className="truncate">{p.title}</span>
          </Link>
        </div>
      ),
    },
    {
      title: "标签",
      key: "tags",
      width: 160,
      align: "center",
      render: (_, p) => (
        <div className="flex flex-wrap gap-1">
          {p.tags.map((t) => (
            <Tag
              key={t.id}
              variant="filled"
              color="#409eff"
              style={{ margin: 0, fontSize: 12 }}
            >
              {t.name}
            </Tag>
          ))}
          {p.tags.length > 2 && (
            <span className="font-display text-[10px] text-ash">
              +{p.tags.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      title: "浏览",
      key: "views",
      width: 90,
      align: "center",
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
      align: "center",
      render: () => (
        <span className="tnum font-display text-[12px] text-fog">0</span>
      ),
    },
    {
      title: "更新",
      key: "updated",
      align: "center",
      width: 100,
      render: (_, p) => (
        <span className="text-[12px] whitespace-nowrap text-ash">
          {timeAgo(p.updatedAt!)}
        </span>
      ),
    },
    {
      title: "状态",
      key: "status",
      width: 70,
      align: "center",
      render: (_, p) => (
        <span className="tnum font-display text-[12px] text-fog">
          {p.status === PostStatus.Published ? "已发布" : "草稿"}
        </span>
      ),
    },
    {
      title: "操作",
      key: "actions",
      width: 80,
      align: "center",
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
            onClick={() => setToDelete(p.id!)}
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-ash transition-colors hover:bg-ruby/10 hover:text-ruby"
          >
            <Trash2 size={14} strokeWidth={2} />
          </button>
        </div>
      ),
    },
  ];

  /**
   * 获取文章列表
   */
  const handleGetPostList = useCallback(() => {
    getPostList(pageSize, page).then((res) => {
      setPosts(res.data);
    });
  }, [pageSize, page]);

  /**
   * 删除文章
   * @param id 文章id
   */
  const handleDeletePost = useCallback(
    async (id: number) => {
      await deletePostById(id);
      message.success("删除文章成功");
      setToDelete(null);
      handleGetPostList();
    },
    [message, handleGetPostList],
  );

  useEffect(() => {
    handleGetPostList();
  }, [handleGetPostList]);
  return (
    <div className="space-y-4">
      {/* 顶部统计与新建 */}
      <Reveal className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold text-cream">文章</span>
          <span className="font-display text-[12px] text-ash">
            共
            <span className="tnum font-medium text-fog">
              {posts.list.length}
            </span>
            篇<span className="ml-1 text-ash">/ 全部 {posts.total}</span> 篇
          </span>
        </div>
        <Button icon={Plus} onClick={() => navigate("/posts/new")}>
          新建文章
        </Button>
      </Reveal>

      {/* 筛选栏（antd 组件） */}
      <Card delay={1} className="flex flex-wrap items-center gap-2.5 p-3">
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
            { value: 2, label: "全部分类" },
            ...categories.map((c) => ({ value: c.id, label: c.name })),
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
            { value: 2, label: "全部状态" },
            { value: 0, label: "已发布" },
            { value: 1, label: "草稿" },
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
      {posts.list.length === 0 ? (
        <Reveal delay={2}>
          <EmptyState
            icon={FileText}
            title="没有匹配的文章"
            hint={q ? "换个关键词试试。" : "点击右上角「新建文章」开始第一篇。"}
          />
        </Reveal>
      ) : (
        <Reveal delay={2}>
          <Table<PostVO>
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
              显示
              <span className="tnum text-fog">
                {(safePage - 1) * pageSize + 1}–
                {Math.min(safePage * pageSize, posts.list.length)}
              </span>{" "}
              / 共 <span className="tnum text-fog">{posts.total}</span> 条记录
            </span>
            <Pagination
              current={safePage}
              pageSize={pageSize}
              total={posts.total}
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
        </Reveal>
      )}

      <ConfirmDialog
        open={toDelete !== null}
        title="删除文章"
        body={`确定删除《${posts.list.find((p) => p.id === toDelete)?.title ?? ""}》吗？相关评论会一并删除，此操作不可撤销。`}
        confirmText="删除"
        onCancel={() => setToDelete(null)}
        onConfirm={() => handleDeletePost(toDelete!)}
      />
    </div>
  );
}
