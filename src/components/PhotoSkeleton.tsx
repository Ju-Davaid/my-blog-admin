import { PictureOutlined } from "@ant-design/icons";
import { Skeleton } from "antd";

/* Skeleton.Node 默认是 96×96 的 inline-block 色块，
   这里同时撑满 root（外层）与 content（节点本身），才能铺满 aspect 比例容器 */
const NODE_STYLE = { width: "100%", height: "100%", borderRadius: 0 };
const ROOT_STYLE = { width: "100%", height: "100%", display: "block" };

/** 单张图片瓦片骨架：放在有确定高度的容器里（如 aspect-4/3） */
export function PhotoTileSkeleton() {
  return (
    <Skeleton.Node active style={NODE_STYLE} styles={{ root: ROOT_STYLE }}>
      <PictureOutlined style={{ fontSize: 30, opacity: 0.35 }} />
    </Skeleton.Node>
  );
}

/** 相册卡片骨架：与真实卡片同尺寸，加载完成时不产生布局跳动 */
function AlbumCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface card-shadow">
      <div className="relative aspect-4/3 overflow-hidden">
        <PhotoTileSkeleton />
      </div>
      <div className="px-3 pt-3 pb-2">
        <Skeleton
          active
          title={{ width: "58%" }}
          paragraph={{ rows: 1, width: ["84%"] }}
        />
      </div>
    </div>
  );
}

/** 相册列表页骨架 */
export function AlbumGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <AlbumCardSkeleton key={i} />
      ))}
    </div>
  );
}

/** 相册内照片网格骨架 */
export function PhotoGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="relative aspect-4/3 overflow-hidden rounded-lg border border-line bg-raised"
        >
          <PhotoTileSkeleton />
        </div>
      ))}
    </div>
  );
}
