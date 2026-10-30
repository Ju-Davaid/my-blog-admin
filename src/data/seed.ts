import type { AppState } from "../types";

/* 可复现的伪随机（种子数据稳定，不做真随机） */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* 近 30 天流量（终点 2026-10-29） */
function buildTraffic() {
  const rand = mulberry32(20261029);
  const points = [];
  const end = new Date("2026-10-29T00:00:00");
  for (let i = 29; i >= 0; i--) {
    const d = new Date(end.getTime() - i * 86400000);
    const weekday = d.getDay();
    const weekendDip = weekday === 0 || weekday === 6 ? 0.55 : 1;
    const trend = 1 + (29 - i) * 0.012;
    const pv = Math.round((140 + rand() * 120) * weekendDip * trend);
    const uv = Math.round(pv * (0.42 + rand() * 0.18));
    points.push({
      date: `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`,
      pv,
      uv,
    });
  }
  return points;
}

export const seedState: AppState = {
  version: 2,
  settings: {
    siteTitle: "DAVAID BLOG",
    slogan: "死亡不属于工人阶级！",
    description:
      "在这里存放一些写不完的代码、拍不满的照片、和偶尔想明白的道理。不做流量，不求更新，只求把日子留下一点痕迹。",
    icp: "蜀ICP备2024000000号-1",
    github: "https://github.com/davaid",
    email: "hi@davaid.site",
  },
  categories: [
    { id: "cat-code", name: "代码", slug: "code", description: "写不完的代码，填不完的坑" },
    { id: "cat-photo", name: "摄影", slug: "photography", description: "拍不满的照片，走不完的路" },
    { id: "cat-essay", name: "随笔", slug: "essays", description: "偶尔想明白的道理" },
  ],
  tags: [
    { id: "tag-react", name: "React", slug: "react", hue: 190 },
    { id: "tag-ts", name: "TypeScript", slug: "typescript", hue: 210 },
    { id: "tag-vite", name: "Vite", slug: "vite", hue: 280 },
    { id: "tag-tailwind", name: "Tailwind", slug: "tailwind", hue: 200 },
    { id: "tag-film", name: "胶片", slug: "film", hue: 35 },
    { id: "tag-bw", name: "黑白", slug: "black-white", hue: 220 },
    { id: "tag-book", name: "读书", slug: "reading", hue: 20 },
    { id: "tag-life", name: "生活", slug: "life", hue: 120 },
  ],
  posts: [
    {
      id: "p1",
      title: "把博客从 WordPress 搬到 Vite 的第七天",
      slug: "wordpress-to-vite-day-7",
      excerpt:
        "迁移比想象顺利，也比想象麻烦。这篇文章记录从 PHP 模板到 React 组件之间的所有落差，以及我为什么觉得值。",
      content: `## 为什么要搬

WordPress 用了五年，最大的问题是**我想改任何东西都要先说服它的主题系统**。一个字号、一行间距、一处留白，全在层层嵌套的 PHP 模板里。

> 工具应该服从手，而不是手服从工具。

## 新栈

- **Vite + React**：构建速度是之前 Webpack 的十倍不止
- **Markdown 直存**：文章就是 \`.md\` 文件，躺在 git 仓库里
- **Tailwind CSS**：样式写在标记旁边，一眼看全
- **静态托管**：没有数据库，没有后台漏洞

\`\`\`ts
// 整站构建，不到三秒
export default defineConfig({
  plugins: [react()],
  build: { outDir: "dist" },
});
\`\`\`

## 七天里踩过的坑

1. **中文 slug**：最终决定保留中文路径，对 SEO 影响不大，对个人博客完全够用
2. **评论系统**：换成了基于 GitHub Issues 的方案，垃圾评论归零
3. **旧链接**：写了几十条 redirect 规则，保住收藏夹里的老读者

## 值不值

值。现在打开编辑器写一篇新文章，从想法到上线只要十分钟。这个博客终于又像一个**博客**了。`,
      categoryId: "cat-code",
      tagIds: ["tag-vite", "tag-react", "tag-tailwind"],
      status: "published",
      hue: 18,
      views: 3241,
      createdAt: "2026-09-18T21:30:00",
      updatedAt: "2026-10-02T22:10:00",
      publishedAt: "2026-09-19T09:00:00",
    },
    {
      id: "p2",
      title: "React 19 的 Compiler 到底替我省了什么",
      slug: "what-react-compiler-saves",
      excerpt:
        "手动 memo 的日子到头了吗？实测了一个中等复杂度的项目，结论比官方文档诚实一点。",
      content: `## 先说结论

React Compiler 没有让代码**变快多少**，但让代码**少写很多**。

\`\`\`tsx
// 以前：到处是这样的防御性代码
const sorted = useMemo(() => [...list].sort(compare), [list]);
const handlePick = useCallback((id: string) => { ... }, []);
\`\`\`

\`\`\`tsx
// 现在：直接写，编译器兜底
const sorted = [...list].sort(compare);
const handlePick = (id: string) => { ... };
\`\`\`

## 实测数据

- 组件重渲染次数：**-71%**
- 首屏 JS 体积：**+3.2%**（编译产物略膨胀）
- 交互延迟（INP）：基本持平

## 什么时候不要开

1. 项目大量依赖**手动精细控制渲染**的性能敏感组件
2. 类组件占比还很高的老代码库
3. 团队还在用 React 17 的思维写代码

> 自动化的前提是信任，信任的前提是理解。先去读它的输出产物。`,
      categoryId: "cat-code",
      tagIds: ["tag-react", "tag-ts"],
      status: "published",
      hue: 195,
      views: 2867,
      createdAt: "2026-08-30T20:00:00",
      updatedAt: "2026-09-05T10:40:00",
      publishedAt: "2026-08-31T08:30:00",
    },
    {
      id: "p3",
      title: "黑白胶片：一次失败的扫街",
      slug: "failed-street-shot-on-film",
      excerpt:
        "三十六张底片，冲出来能看的只有四张。但 failure 是胶片的一部分，也是扫街的一部分。",
      content: `## 失败统计

- **糊片**：9 张（估焦失败 + 手抖）
- **欠曝**：11 张（阴天按晴天测光）
- **构图莫名**：8 张（看到就按，没想清楚）
- **能看**：4 张
- **喜欢**：1 张

## 唯一喜欢的那张

巷口修鞋匠的灯。傍晚六点半，钨丝灯泡的色温在黑白里变成一团干净的亮，他的手悬在鞋面上方一厘米。

> 胶片教会我的不是耐心，是接受。接受三十六分之三十五的不如意，然后为了那一张继续。

## 下次改进

1. 阴天把 ISO 400 的卷按 250 曝光
2. 拍之前先站定三秒
3. 少拍一点，想清楚再按`,
      categoryId: "cat-photo",
      tagIds: ["tag-film", "tag-bw"],
      status: "published",
      hue: 220,
      views: 1543,
      createdAt: "2026-09-26T18:20:00",
      updatedAt: "2026-09-27T09:15:00",
      publishedAt: "2026-09-27T10:00:00",
    },
    {
      id: "p4",
      title: "在祁连山看日出，风把云吹成了河",
      slug: "qilian-mountain-sunrise",
      excerpt:
        "海拔四千米，凌晨五点，零下六度。等一场日出值不值？值。照片拍出来值不值？另一回事。",
      content: `## 凌晨四点的出发

头灯的光柱里全是自己的呼吸。向导说今天云多，不一定看得到。来都来了。

## 五点四十七分

天先从**云的下面**亮起来——一条橙红色的缝，横贯整个东边。然后是风，把云从固体吹成了流体。

> 高原的日出不是升起来的，是漫过来的。

## 关于照片

回来看raw文件，没有一张配得上当时。有些场景负责留在眼睛里，相机只负责作证你来过。`,
      categoryId: "cat-photo",
      tagIds: ["tag-life", "tag-bw"],
      status: "published",
      hue: 35,
      views: 1988,
      createdAt: "2026-08-12T22:00:00",
      updatedAt: "2026-08-14T19:30:00",
      publishedAt: "2026-08-13T11:00:00",
    },
    {
      id: "p5",
      title: "重读《活着》：这一次注意到的是牛",
      slug: "rereading-to-live",
      excerpt:
        "十年前读福贵，读到的是惨。这次读，读到的是田埂上那头老牛的名字。",
      content: `## 十年两读

第一次读在大二，觉得福贵的人生是一场漫长的失去：赌掉家产、战场、有庆、凤霞、家珍、二喜、苦根。

这次重读，印象最深的反而是结尾——

> 老人和牛渐渐远去……炊烟在农舍的屋顶袅袅升起。

## 牛的名字

福贵给牛起名叫「福贵」。村里人笑他，他说牛像他，年纪大了，干活慢了，但还在田里走。

一个人和自己的命运达成了**和解甚至合伙**，这是十年前我完全读不懂的东西。

## 为什么是现在

大概因为今年项目黄了一个、相机摔了一台、头发少了三分之一。读完反而踏实了。`,
      categoryId: "cat-essay",
      tagIds: ["tag-book", "tag-life"],
      status: "published",
      hue: 28,
      views: 2310,
      createdAt: "2026-07-20T21:00:00",
      updatedAt: "2026-07-22T23:00:00",
      publishedAt: "2026-07-21T09:30:00",
    },
    {
      id: "p6",
      title: "Tailwind CSS 4 升级手记：比想象顺，比文档乱",
      slug: "tailwind-v4-upgrade-notes",
      excerpt:
        "从 v3 升 v4 用了一个晚上。@theme 的设计是对的，但迁移指南把三件事讲成了一件。",
      content: `## 一句话总结

**删配置、进 CSS、@theme 一统天下。**

\`\`\`css
/* v4：设计令牌直接写在 CSS 里 */
@import "tailwindcss";

@theme {
  --color-ember: #ff6b2c;
  --font-display: "JetBrains Mono", monospace;
}
\`\`\`

## 迁移步骤备忘

1. 卸载 \`tailwind.config.js\`，内容搬进 \`@theme\`
2. \`content\` 配置不再需要——自动扫描
3. 常用类名没有 breaking change，**变体语法**变了：\`group-hover:\` → 仍然可用，但插件变体需重写
4. \`@apply\` 行为更严格，冲突类会直接报错

## 一个坑

升级后首屏闪烁一次未样式化的内容，原因是构建插件顺序。把 \`@tailwindcss/vite\` 放在插件数组**最前**解决。

> 升级当晚的 commit message：\`chore: ride the tailwind\`。`,
      categoryId: "cat-code",
      tagIds: ["tag-tailwind", "tag-vite"],
      status: "draft",
      hue: 200,
      views: 0,
      createdAt: "2026-10-20T23:30:00",
      updatedAt: "2026-10-25T01:12:00",
      publishedAt: null,
    },
    {
      id: "p7",
      title: "深夜食堂与泡面：碳水化合物的安慰剂效应",
      slug: "midnight-instant-noodles",
      excerpt: "加班到十一点，泡面五分钟。这五分钟里获得的东西，营养表上没有。",
      content: `## 一个观察

楼下便利店的泡面货架，晚上十点半之后销量是白天的三倍。买的人眼睛里都是同一种东西——**今天快结束了**。

## 泡面的仪式感

- 水必须刚开
- 盖子必须压一本没读完的书
- 三分钟是底线，四分半是灵魂
- 最后一口汤才算数

> 人需要的有时候不是食物，是一个可以被允许的、五分钟的小仪式。

## 免责声明

营养师朋友看到这篇文章请息怒，我一周只吃三次。`,
      categoryId: "cat-essay",
      tagIds: ["tag-life"],
      status: "published",
      hue: 120,
      views: 4120,
      createdAt: "2026-06-15T23:40:00",
      updatedAt: "2026-06-16T00:30:00",
      publishedAt: "2026-06-16T08:00:00",
    },
    {
      id: "p8",
      title: "用 Three.js 做一个不卡的粒子背景",
      slug: "threejs-particle-background",
      excerpt:
        "博客首页那个粒子背景是怎么做的：3000 个粒子、一次 draw call、零 GC 分配，以及为什么不用现成库。",
      content: `## 目标

首页背景：3000 个随鼠标微微散开的粒子，60fps，移动端不掉帧。

## 三个关键决策

\`\`\`ts
// 1. 一个 BufferGeometry 装下所有粒子，一次 draw call
const geo = new THREE.BufferGeometry();
geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));

// 2. 动画只改数组，不重建对象（零 GC）
for (let i = 0; i < count; i++) {
  positions[i * 3 + 1] += Math.sin(t + i) * 0.02;
}

// 3. 像素比封顶，移动端立省 60% 填充率
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
\`\`\`

## 为什么不用现成库

粒子库做的是「通用粒子系统」，我要的是「一个特定效果」。200 行代码写完，还顺带学会了 instancing。

## 性能红线

- draw call ≤ 2
- 每帧分配 0 个对象
- \`prefers-reduced-motion\` 时直接静态渲染`,
      categoryId: "cat-code",
      tagIds: ["tag-react"],
      status: "draft",
      hue: 265,
      views: 0,
      createdAt: "2026-10-26T22:00:00",
      updatedAt: "2026-10-28T23:45:00",
      publishedAt: null,
    },
  ],
  comments: [
    {
      id: "c1",
      postId: "p1",
      author: "老白",
      content:
        "「工具应该服从手」这句话值一篇文章。我也是从 WordPress 迁出来的，看完又想把主题重写一遍了。",
      status: "approved",
      createdAt: "2026-09-20T14:22:00",
    },
    {
      id: "c2",
      postId: "p1",
      author: "Kira",
      content: "中文 slug 那个点太真实了，当年纠结了两周，最后也是直接上了。",
      status: "approved",
      createdAt: "2026-09-21T09:03:00",
    },
    {
      id: "c3",
      postId: "p2",
      author: "nullptr",
      content: "请问 Compiler 在大型表单场景下有实测过吗？我们项目几百个受控输入，担心编译产物膨胀。",
      status: "pending",
      createdAt: "2026-10-28T21:17:00",
    },
    {
      id: "c4",
      postId: "p3",
      author: "胶片盒",
      content: "三十六分之四的出片率已经很好了！我上次扫街两卷能看的只有三张……",
      status: "approved",
      createdAt: "2026-09-28T16:44:00",
    },
    {
      id: "c5",
      postId: "p7",
      author: "匿名",
      content: "低价代购球鞋 加微信 xxxxxx 一手货源",
      status: "spam",
      createdAt: "2026-10-12T03:12:00",
    },
    {
      id: "c6",
      postId: "p5",
      author: "阿棠",
      content: "「和自己的命运达成合伙」——这句话让我把书重新加入了购物车。",
      status: "pending",
      createdAt: "2026-10-29T08:35:00",
    },
    {
      id: "c7",
      postId: "p4",
      author: "山风",
      content: "祁连山那段看哭了。明年夏天打算走一遍，能分享一下具体路线吗？",
      status: "pending",
      createdAt: "2026-10-29T11:02:00",
    },
  ],
  albums: [
    { id: "al-street", name: "街头", description: "走街串巷，抓一些不设防的瞬间", createdAt: "2026-09-01T00:00:00" },
    { id: "al-land", name: "山河", description: "祁连、垭口、经幡，和风", createdAt: "2026-08-10T00:00:00" },
    { id: "al-daily", name: "日常", description: "猫、便利店、窗台的光", createdAt: "2026-10-01T00:00:00" },
    { id: "al-film", name: "胶片", description: "HP5+ / 过期胶卷的颗粒", createdAt: "2026-09-20T00:00:00" },
  ],
  photos: [
    { id: "ph1", title: "修鞋匠的灯", albumId: "al-street", caption: "傍晚六点半，钨丝灯亮起的瞬间", hue: 35, takenAt: "2026-09-26" },
    { id: "ph2", title: "雨后的斑马线", albumId: "al-street", caption: "积水把红绿灯借给了地面", hue: 200, takenAt: "2026-09-12" },
    { id: "ph3", title: "祁连日出", albumId: "al-land", caption: "云被风从固体吹成了流体", hue: 22, takenAt: "2026-08-13" },
    { id: "ph4", title: "垭口的经幡", albumId: "al-land", caption: "海拔四千米，风比人先说话", hue: 275, takenAt: "2026-08-12" },
    { id: "ph5", title: "窗台上的猫", albumId: "al-daily", caption: "它每天准时在下午三点到达", hue: 45, takenAt: "2026-10-05" },
    { id: "ph6", title: "深夜便利店", albumId: "al-daily", caption: "城市最后的温柔是二十四小时的", hue: 160, takenAt: "2026-10-15" },
    { id: "ph7", title: "巷口的自行车", albumId: "al-film", caption: "HP5+ 按 800  pushed 两档", hue: 220, takenAt: "2026-09-26" },
    { id: "ph8", title: "奶奶的旧木柜", albumId: "al-film", caption: "五十年前的漆光还在", hue: 30, takenAt: "2026-10-20" },
  ],
  traffic: buildTraffic(),
};
