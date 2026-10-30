import {useState} from "react";
import {NavLink, Outlet, useLocation} from "react-router-dom";
import {
  CommentOutlined,
  FolderOutlined,
  LogoutOutlined,
  MenuOutlined,
  PictureOutlined,
  SettingOutlined,
  FileTextOutlined,
  DashboardOutlined,
  LinkOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import {Dropdown} from "antd";
import {MoonOutlined, SunOutlined} from "@ant-design/icons";
import {useStore} from "../data/hooks";
import {useTheme} from "../theme/useTheme";
import {UserAvatar} from "./ui";

const NAV = [
  {to: "/", label: "仪表盘", icon: DashboardOutlined},
  {to: "/posts", label: "文章", icon: FileTextOutlined},
  {to: "/taxonomy", label: "分类标签", icon: FolderOutlined},
  {to: "/photos", label: "照片", icon: PictureOutlined},
  {to: "/moments", label: "动态", icon: MessageOutlined},
  {to: "/comments", label: "评论", icon: CommentOutlined},
  {to: "/settings", label: "设置", icon: SettingOutlined},
];

function titleOf(pathname: string): string {
  if (pathname.startsWith("/posts/")) return "编辑文章";
  if (pathname.startsWith("/posts")) return "文章";
  const hit = NAV.find((n) => n.to !== "/" && pathname.startsWith(n.to));
  return hit ? hit.label : "仪表盘";
}

function TopNav({onNavigate}: {onNavigate?: () => void}) {
  const {state} = useStore();
  const pending = state.comments.filter((c) => c.status === "pending").length;

  return (
    <nav className="flex flex-1 items-center gap-1 px-6 max-md:px-3">
      {NAV.map(({to, label, icon: Icon}) => (
        <NavLink
          key={to}
          to={to}
          end={to === "/"}
          onClick={onNavigate}
          className={({isActive}) =>
            `relative flex items-center gap-1.5 px-3.5 py-4 text-[14px] transition-colors ${
              isActive ? "font-medium text-[#409eff]" : "text-fog hover:text-[#409eff]"
            }`
          }
        >
          {({isActive}) => (
            <>
              <Icon />
              <span>{label}</span>
              {to === "/comments" && pending > 0 && (
                <span className="tnum ml-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#f56c6c] px-1 text-[10px] font-bold text-white">
                  {pending}
                </span>
              )}
              {isActive && (
                <span className="absolute inset-x-3 bottom-0 h-[2.5px] rounded-t bg-[#409eff]" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Layout({onLogout}: {onLogout: () => void}) {
  const {state} = useStore();
  const {mode, toggle} = useTheme();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  const title = titleOf(location.pathname);
  const dark = mode === "dark";
  const user = state.settings.username?.trim() || "DAVAID";

  const userMenu = {
    items: [
      {
        key: "site",
        icon: <LinkOutlined />,
        label: (
          <a href="https://davaid.site" target="_blank" rel="noreferrer">
            查看站点
          </a>
        ),
      },
      {type: "divider" as const},
      {key: "logout", icon: <LogoutOutlined />, label: "退出登录", danger: true},
    ],
    onClick: ({key}: {key: string}) => {
      if (key === "logout") onLogout();
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-ink">
      {/* ===== 白色顶栏 ===== */}
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center px-4 sm:px-6">
          {/* Logo */}
          <NavLink to="/" className="mr-8 flex shrink-0 items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#409eff] to-[#66b1ff] text-[15px] font-extrabold text-white">
              D
            </span>
            <span className="text-[15px] font-bold tracking-wide text-cream">
              DAVAID
              <span className="ml-1.5 hidden text-[11px] font-normal text-ash sm:inline">
                Blog Console
              </span>
            </span>
          </NavLink>

          {/* 桌面横向菜单 */}
          <div className="hidden flex-1 lg:block">
            <TopNav />
          </div>

          {/* 右侧用户区 */}
          <div className="ml-auto flex items-center gap-4">
            <a
              href="https://davaid.site"
              target="_blank"
              rel="noreferrer"
              className="hidden items-center gap-1.5 text-[13px] text-fog transition-colors hover:text-[#409eff] md:flex"
            >
              <LinkOutlined />
              davaid.site
            </a>
            {/* 主题切换 */}
            <button
              onClick={toggle}
              aria-label={dark ? "切换到亮色模式" : "切换到暗色模式"}
              title={dark ? "切换到亮色模式" : "切换到暗色模式"}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-fog transition-colors hover:bg-raised hover:text-ember"
            >
              {dark ? <SunOutlined /> : <MoonOutlined />}
            </button>
            <Dropdown menu={userMenu} placement="bottomRight" trigger={["click"]}>
              <button className="flex cursor-pointer items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-raised">
                <UserAvatar name={user} src={state.settings.avatar} size={28} />
                <span className="hidden max-w-32 truncate text-[13px] text-cream md:block">{user}</span>
              </button>
            </Dropdown>
            {/* 移动端菜单按钮 */}
            <button
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md text-fog lg:hidden"
              onClick={() => setDrawer((v) => !v)}
              aria-label="打开菜单"
            >
              <MenuOutlined />
            </button>
          </div>
        </div>

        {/* 移动端抽屉菜单 */}
        {drawer && (
          <div className="fade-in border-t border-line bg-surface lg:hidden">
            <TopNav onNavigate={() => setDrawer(false)} />
          </div>
        )}
      </header>

      {/* ===== 内容区 ===== */}
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-5 sm:px-6 lg:py-6">
        {location.pathname !== "/" && (
          <div className="mb-4 flex items-center gap-2 text-[13px] text-ash">
            <span>首页</span>
            <span>/</span>
            <span className="text-cream">{title}</span>
          </div>
        )}
        <Outlet />
      </main>

      <footer className="py-5 text-center text-[12px] text-ash">
        {state.settings.siteTitle} · Console — 不做流量，不求更新，只求把日子留下一点痕迹
      </footer>
    </div>
  );
}
