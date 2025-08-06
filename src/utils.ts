import type { WorksSourceMetrics, ChartNode } from "./types";
import * as d3 from "d3";

export const subfieldColors = {
  "Machine Learning": "#ff7f0e",
  "Computer Vision": "#1f77b4",
  "Natural Language Processing": "#2ca02c",
  Robotics: "#d62728",
};

export const topicColors = {
  "Machine Learning": ["#fee0d2", "#fb6a4a", "#de2d26"],
  "Computer Vision": ["#c6dbef", "#4292c6", "#084594"],
  "Natural Language Processing": ["#e7f3e7", "#a1d99b", "#238b45"],
  Robotics: ["#fdd0a2", "#f16913", "#d94801"],
};

export function prepareChartData(rawData: WorksSourceMetrics[]): {
  seriesData: ChartNode[];
} {
  const seriesData: ChartNode[] = [];
  let idx = 0;

  const subfieldMap = new Map<string, { total: number; index: number }>();
  rawData.forEach((item) => {
    if (!subfieldMap.has(item.subfieldName)) {
      subfieldMap.set(item.subfieldName, { total: 0, index: idx++ });
    }
    subfieldMap.get(item.subfieldName)!.total += item.workCount;
  });

  subfieldMap.forEach((info, name) => {
    seriesData.push({
      id: name,
      value: info.total,
      depth: 1,
      index: info.index,
      color: subfieldColors[name] || "#cccccc",
    });
  });

  rawData.forEach((item, i) => {
    const parent = item.subfieldName;
    const id = `${parent}.${item.topicName}`;
    const colors = topicColors[parent] || [];
    const color = colors.length
      ? colors[i % colors.length]
      : subfieldColors[parent] || "#cccccc";
    seriesData.push({
      id,
      value: item.workCount,
      depth: 2,
      index: idx++,
      color,
    });
  });

  const rootValue = Array.from(subfieldMap.values()).reduce(
    (sum, v) => sum + v.total,
    0
  );
  seriesData.unshift({
    id: "root",
    value: rootValue,
    depth: 0,
    index: idx++,
    color: "transparent",
  });

  return { seriesData };
}

export function stratifyData(seriesData: ChartNode[]) {
  return d3
    .stratify<ChartNode>()
    .id((d) => d.id)
    .parentId((d) => {
      if (d.id === "root") return null;

      if (!d.id.includes(".")) return "root";

      return d.id.slice(0, d.id.lastIndexOf("."));
    })(seriesData)
    .sum((d) => d.value)
    .sort((a, b) => (b.value || 0) - (a.value || 0));
}

export function overallLayout(
  displayRoot: d3.HierarchyNode<ChartNode>,
  params,
  api
) {
  const context = params.context;
  d3
    .pack<ChartNode>()
    .size([api.getWidth() - 2, api.getHeight() - 2])
    .padding(3)(displayRoot);
  context.nodes = {};
  displayRoot.descendants().forEach((node) => {
    if (node.id !== undefined) {
      context.nodes[node.id] = node;
    }
  });
}

export function createRenderItem(getRoot: () => d3.HierarchyNode<ChartNode>) {
  return function renderItem(params, api) {
    const context = params.context;
    if (!context.layout) {
      context.layout = true;
      overallLayout(getRoot(), params, api);
    }
    const node = context.nodes[api.value("id")];
    if (!node) return;
    const isLeaf = !node.children || !node.children.length;
    const focus = new Uint32Array(node.descendants().map((n) => n.data.index));
    const nodeName = isLeaf
      ? node.data.id.slice(node.data.id.lastIndexOf(".") + 1)
      : "";

    return {
      type: "circle",
      shape: { cx: node.x, cy: node.y, r: node.r },
      focus,
      transition: ["shape"],
      z2: node.depth * 2,
      style: { fill: node.data.color },
      textContent: {
        type: "text",
        style: {
          text: nodeName,
          fontFamily: "Helvetica",
          width: node.r * 1.3,
          overflow: "break",
          fontSize: node.r / 3,
        },
        emphasis: {
          style: { overflow: null, fontSize: Math.max(node.r / 3, 12) },
        },
      },
      textConfig: { position: "inside" },
      emphasis: {
        style: {
          shadowBlur: 20,
          shadowOffsetX: 3,
          shadowOffsetY: 5,
          shadowColor: "rgba(0,0,0,0.3)",
        },
      },
    };
  };
}
