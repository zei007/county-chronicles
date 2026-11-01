/**
 * echarts.ts — ECharts 按需注册（v1.2.1 性能优化）
 *
 * 此前 `import * as echarts from "echarts"` 会打包完整库（min ~1MB）。
 * 现改为 echarts/core + 仅注册项目实际用到的图表与组件，体积大幅下降。
 * 全项目图表一律经 EChart.tsx 封装使用本模块；新增图表类型时在下方补注册。
 */
import * as echarts from "echarts/core";
import { LineChart, BarChart, ScatterChart, EffectScatterChart, LinesChart, RadarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  GeoComponent,
  MarkLineComponent,
  AxisPointerComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([
  // 图表：趋势线/柱状/散点/涟漪散点/迁飞线/雷达
  LineChart,
  BarChart,
  ScatterChart,
  EffectScatterChart,
  LinesChart,
  RadarChart,
  // 组件：直角坐标系/提示框/图例/地理坐标/标记线/轴指示器
  GridComponent,
  TooltipComponent,
  LegendComponent,
  GeoComponent,
  MarkLineComponent,
  AxisPointerComponent,
  CanvasRenderer,
]);

export * from "echarts/core";
