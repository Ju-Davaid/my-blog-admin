import {
  ArrowUpRight,
  Check,
  FileText,
  Image as ImageIcon,
  MessageSquare,
  PenLine,
  Eye,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { TrafficChart } from "../components/TrafficChart";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  EmptyState,
  StatusDot,
} from "../components/ui";
import { useStore } from "../data/hooks";
import { formatNumber, timeAgo } from "../utils/format";

/* 数字滚动 */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dur = reduce ? 0 : duration;
    const start = performance.now();
    const tick = (now: number) => {
      const p = dur === 0 ? 1 : Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return value;
}

function StatCard({
  label,
  en,
  value,
  sub,
  icon: Icon,
  delay,
}: {
  label: string;
  en: string;
  value: number;
  sub: React.ReactNode;
  icon: React.ElementType;
  delay: string;
}) {
  const display = useCountUp(value);
  return (
    <Card
      className={`reveal ${delay} p-5 transition-colors duration-200 hover:border-line-strong`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="font-display text-[10px] tracking-[0.18em] text-ash uppercase">
            {label} · {en}
          </div>
          <div className="tnum mt-2 font-display text-4xl font-extrabold tracking-tight text-cream">
            {formatNumber(display)}
          </div>
          <div className="mt-2 text-xs text-fog">{sub}</div>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ash">
          <Icon size={16} strokeWidth={1.8} />
        </span>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const { state, setCommentStatus } = useStore();
  const navigate = useNavigate();

  const published = state.posts.filter((p) => p.status === "published");
  const drafts = state.posts.filter((p) => p.status === "draft");
  const pendingComments = state.comments.filter((c) => c.status === "pending");
  const totalViews = state.posts.reduce((s, p) => s + p.views, 0);

  const recentPosts = useMemo(
    () =>
      [...state.posts]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 5),
    [state.posts],
  );

  const commentPostTitle = (postId: string) =>
    state.posts.find((p) => p.id === postId)?.title ?? "（文章已删除）";

  const last7 = useMemo(() => state.traffic.slice(-7), [state.traffic]);
  const pv7 = last7.reduce((s, d) => s + d.pv, 0);
  const pvPrev = state.traffic.slice(-14, -7).reduce((s, d) => s + d.pv, 0);
  const delta = pvPrev > 0 ? Math.round(((pv7 - pvPrev) / pvPrev) * 100) : 0;

  return (
    <div className="space-y-5">
      {/* 欢迎条 */}
      <div className="reveal flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-display text-[11px] tracking-[0.2em] text-ash uppercase">
            {new Date().getHours() < 12
              ? "Good Morning"
              : new Date().getHours() < 18
                ? "Good Afternoon"
                : "Good Evening"}
            , DAVAID
          </p>
          <h2 className="mt-1 font-display text-2xl font-extrabold tracking-tight">
            今天也留下一点痕迹<span className="text-ember">。</span>
          </h2>
        </div>
        <Button icon={PenLine} onClick={() => navigate("/posts/new")}>
          写新文章
        </Button>
      </div>

      {/* 统计卡 */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="文章"
          en="Posts"
          value={state.posts.length}
          sub={`已发布 ${published.length} · 草稿 ${drafts.length}`}
          icon={FileText}
          delay="reveal-1"
        />
        <StatCard
          label="总浏览"
          en="Views"
          value={totalViews}
          sub={`近 7 天 ${formatNumber(pv7)} PV`}
          icon={Eye}
          delay="reveal-2"
        />
        <StatCard
          label="评论"
          en="Comments"
          value={state.comments.filter((c) => c.status !== "spam").length}
          sub={`待审核 ${pendingComments.length} 条`}
          icon={MessageSquare}
          delay="reveal-3"
        />
        <StatCard
          label="照片"
          en="Photos"
          value={state.photos.length}
          sub={`${state.albums.length} 个相册`}
          icon={ImageIcon}
          delay="reveal-4"
        />
      </div>

      {/* 流量图 */}
      <Card className="reveal reveal-2">
        <CardHeader
          title="访问趋势 · 近30天"
          extra={
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-display text-[11px] text-fog">
                <span className="h-2 w-3 rounded-full bg-ember" /> PV
              </span>
              <span className="flex items-center gap-1.5 font-display text-[11px] text-fog">
                <span className="h-2 w-3 rounded-full bg-haze" /> UV
              </span>
              <Badge tone={delta >= 0 ? "moss" : "ruby"}>
                {delta >= 0 ? "+" : ""}
                {delta}% WoW
              </Badge>
            </div>
          }
        />
        <div className="p-4">
          <TrafficChart data={state.traffic} />
        </div>
      </Card>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* 最近文章 */}
        <Card className="reveal reveal-3 lg:col-span-3">
          <CardHeader
            title="最近更新 · Recent"
            extra={
              <Link
                to="/posts"
                className="link-sweep flex items-center gap-1 font-display text-[11px] tracking-wider text-fog uppercase hover:text-ember"
              >
                全部 <ArrowUpRight size={12} />
              </Link>
            }
          />
          <ul className="divide-y divide-line">
            {recentPosts.map((p) => (
              <li key={p.id}>
                <Link
                  to={`/posts/${p.id}`}
                  className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-raised/60"
                >
                  <StatusDot
                    color={p.status === "published" ? "moss" : "gold"}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-cream transition-colors group-hover:text-ember">
                      {p.title}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-ash">
                      {state.categories.find((c) => c.id === p.categoryId)
                        ?.name ?? "未分类"}{" "}
                      · {timeAgo(p.updatedAt)}
                    </div>
                  </div>
                  <span className="tnum font-display text-xs text-fog">
                    {formatNumber(p.views)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        {/* 待办 */}
        <Card className="reveal reveal-4 lg:col-span-2">
          <CardHeader
            title="待办 · Todo"
            extra={
              <StatusDot color="gold" pulse={pendingComments.length > 0} />
            }
          />
          <div className="space-y-4 p-5">
            {pendingComments.length === 0 && drafts.length === 0 ? (
              <EmptyState
                icon={Check}
                title="全部清空"
                hint="没有待审核评论，也没有未完成草稿。"
              />
            ) : (
              <>
                {pendingComments.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="rounded-md border border-line bg-raised/50 p-3"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-display text-xs font-bold text-gold">
                        {c.author}
                      </span>
                      <span className="text-[11px] text-ash">
                        {timeAgo(c.createdAt)}
                      </span>
                    </div>
                    <p className="mb-2 line-clamp-2 text-[13px] leading-relaxed text-fog">
                      评论《{commentPostTitle(c.postId)}》：{c.content}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="min-h-7.5 px-2.5 text-xs"
                        onClick={() => setCommentStatus(c.id, "approved")}
                      >
                        通过
                      </Button>
                      <Link
                        to="/comments"
                        className="flex items-center font-display text-[11px] tracking-wider text-ash uppercase hover:text-cream"
                      >
                        去处理 <ArrowUpRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
                {drafts.slice(0, 2).map((p) => (
                  <Link
                    key={p.id}
                    to={`/posts/${p.id}`}
                    className="group flex items-center justify-between rounded-md border border-dashed border-line-strong p-3 transition-colors hover:border-ember"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium text-fog group-hover:text-cream">
                        {p.title}
                      </div>
                      <div className="text-[11px] text-ash">
                        草稿 · 上次编辑 {timeAgo(p.updatedAt)}
                      </div>
                    </div>
                    <PenLine
                      size={14}
                      className="shrink-0 text-ash group-hover:text-ember"
                    />
                  </Link>
                ))}
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
