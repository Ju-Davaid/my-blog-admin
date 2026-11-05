/** 相册封面 / 照片瓦片的 antd Image 铺满样式（列表页与详情页共用） */
export const TILE_CLASS_NAMES = { root: "photo-tile", image: "photo-tile-img" };

export const TILE_STYLES = {
  root: {
    position: "absolute",
    inset: 0,
    display: "block",
    width: "100%",
    height: "100%",
  } as const,
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  } as const,
};
