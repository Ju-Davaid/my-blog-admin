import {useMemo} from "react";
import type {TrafficPoint} from "../types";
import {EChart} from "./EChart";
import {useTheme} from "../theme/useTheme";

/* 30 天 PV/UV 双面积图：蓝主线 + 橙次线（跟随亮暗主题） */

export function TrafficChart({data}: {data: TrafficPoint[]}) {
  const {mode} = useTheme();
  const dark = mode === "dark";

  const option = useMemo(
    () => ({
      animationDuration: 700,
      grid: {left: 48, right: 16, top: 30, bottom: 28},
      tooltip: {
        trigger: "axis" as const,
        backgroundColor: dark ? "#21262d" : "#ffffff",
        borderColor: dark ? "#3d444d" : "#e8eaed",
        textStyle: {color: dark ? "#e6edf3" : "#1f2329", fontSize: 12},
        axisPointer: {type: "line" as const, lineStyle: {color: dark ? "#3d444d" : "#d9dde3"}},
      },
      legend: {
        data: ["PV", "UV"],
        right: 0,
        top: 0,
        icon: "roundRect",
        itemWidth: 12,
        itemHeight: 4,
        textStyle: {color: dark ? "#9198a1" : "#646a73", fontSize: 12},
      },
      xAxis: {
        type: "category" as const,
        boundaryGap: false,
        data: data.map((d) => d.date),
        axisLine: {lineStyle: {color: dark ? "#2d333b" : "#e8eaed"}},
        axisTick: {show: false},
        axisLabel: {color: dark ? "#656d76" : "#8f959e", fontSize: 11},
      },
      yAxis: {
        type: "value" as const,
        splitLine: {
          lineStyle: {color: dark ? "#21262d" : "#f0f2f5", type: "dashed" as const},
        },
        axisLabel: {color: dark ? "#656d76" : "#8f959e", fontSize: 11},
      },
      series: [
        {
          name: "PV",
          type: "line" as const,
          smooth: true,
          symbol: "circle",
          symbolSize: 5,
          showSymbol: false,
          data: data.map((d) => d.pv),
          lineStyle: {width: 2, color: "#409eff"},
          itemStyle: {color: "#409eff"},
          areaStyle: {
            color: {
              type: "linear" as const,
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                {offset: 0, color: "rgba(64,158,255,0.25)"},
                {offset: 1, color: "rgba(64,158,255,0.02)"},
              ],
            },
          },
        },
        {
          name: "UV",
          type: "line" as const,
          smooth: true,
          symbol: "circle",
          symbolSize: 5,
          showSymbol: false,
          data: data.map((d) => d.uv),
          lineStyle: {width: 2, color: "#e6a23c"},
          itemStyle: {color: "#e6a23c"},
          areaStyle: {
            color: {
              type: "linear" as const,
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                {offset: 0, color: "rgba(230,162,60,0.2)"},
                {offset: 1, color: "rgba(230,162,60,0.02)"},
              ],
            },
          },
        },
      ],
    }),
    [data, dark],
  );

  return <EChart option={option} height={260} />;
}
