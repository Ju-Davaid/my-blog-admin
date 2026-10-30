import type {ReactNode} from "react";
import {ConfigProvider, theme as antdTheme} from "antd";
import zhCN from "antd/locale/zh_CN";
import {useTheme} from "../theme/useTheme";

/* antd 全局主题：亮 / 暗双算法，若依蓝 + Element UI 状态色 */

const sharedToken = {
  colorPrimary: "#409eff",
  colorSuccess: "#67c23a",
  colorWarning: "#e6a23c",
  colorError: "#f56c6c",
  colorInfo: "#409eff",
  borderRadius: 6,
  fontSize: 13,
  fontFamily: "'Inter Tight', 'PingFang SC', 'Microsoft YaHei', sans-serif",
};

const lightToken = {
  ...sharedToken,
  colorBgContainer: "#ffffff",
  colorBgLayout: "#f0f2f5",
  colorBorder: "#dcdfe6",
  colorBorderSecondary: "#e8eaed",
  colorText: "#1f2329",
  colorTextSecondary: "#646a73",
  colorTextTertiary: "#8f959e",
};

const darkToken = {
  ...sharedToken,
  colorBgContainer: "#161b22",
  colorBgLayout: "#0d1117",
  colorBgElevated: "#21262d",
  colorBorder: "#3d444d",
  colorBorderSecondary: "#2d333b",
  colorText: "#e6edf3",
  colorTextSecondary: "#9198a1",
  colorTextTertiary: "#656d76",
};

export function AntdProvider({children}: {children: ReactNode}) {
  const {mode} = useTheme();
  const dark = mode === "dark";

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: dark ? darkToken : lightToken,
      }}
    >
      {children}
    </ConfigProvider>
  );
}
