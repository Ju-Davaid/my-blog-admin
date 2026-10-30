import { useEffect, useRef, memo } from "react";
import * as echarts from "echarts";

interface EChartProps {
  option: echarts.EChartsOption;
  height?: number;
  className?: string;
}

export const EChart = memo<EChartProps>(
  ({ option, height = 260, className = "" }) => {
    const ref = useRef<HTMLDivElement>(null);
    const chartRef = useRef<echarts.ECharts | null>(null);

    useEffect(() => {
      if (!ref.current) return;
      const chart = echarts.init(ref.current);
      chartRef.current = chart;

      const onResize = () => chart.resize();
      window.addEventListener("resize", onResize);
      const ro = new ResizeObserver(onResize);
      ro.observe(ref.current);

      return () => {
        window.removeEventListener("resize", onResize);
        ro.disconnect();
        chart.dispose();
        chartRef.current = null;
      };
    }, []);

    useEffect(() => {
      chartRef.current?.setOption(option, true);
    }, [option]);

    return (
      <div ref={ref} className={className} style={{ height, width: "100%" }} />
    );
  },
);
