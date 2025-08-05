// This file contains a React functional component `Chart` that visualizes data using ECharts and D3. 
// It imports necessary libraries and defines several interfaces, including `ChartProps`, `HierarchyData`, `FlattenedNode`, and `RenderContext`. 
// The component uses hooks to manage layout effects and render a circular packing chart based on the provided data.

import React, { useLayoutEffect } from 'react';
import * as echarts from 'echarts';
import * as d3 from 'd3';
import type { SimpleNode } from './types';

interface ChartProps {
  data: SimpleNode[];
  width?: number;
  height?: number;
}

interface HierarchyData {
  name: string;
  children?: SimpleNode[];
}

interface FlattenedNode {
  id: string;
  name: string;
  value: number;
  depth: number;
  type: string;
  index: number;
  subfieldId?: string;
  topicId?: string;
}

interface RenderContext {
  layout?: boolean;
  nodes: Record<string, d3.HierarchyCircularNode<SimpleNode | HierarchyData>>;
}

const Chart: React.FC<ChartProps> = ({ data, width = 800, height = 600 }) => {
  useLayoutEffect(() => {
    const chartDom = document.getElementById('chartContainer');
    if (!chartDom) return;

    const circleChart = echarts.init(chartDom);
    let displayRoot: d3.HierarchyCircularNode<SimpleNode | HierarchyData>;

    function createHierarchy(): d3.HierarchyNode<SimpleNode | HierarchyData> {
      return d3
        .hierarchy({
          name: 'Root',
          children: data,
        } as HierarchyData)
        .sum((d) => {
          if (d && typeof d === 'object' && 'value' in d && typeof d.value === 'number') {
            return d.value;
          }
          return 0;
        })
        .sort((a, b) => (b.value || 0) - (a.value || 0));
    }

    function flattenHierarchy(root: d3.HierarchyCircularNode<SimpleNode | HierarchyData>): FlattenedNode[] {
      const flattened: FlattenedNode[] = [];
      root.descendants().forEach((node, index) => {
        const nodeData = node.data;
        flattened.push({
          id: ('subfieldId' in nodeData ? nodeData.subfieldId : undefined) ||
            ('topicId' in nodeData ? nodeData.topicId : undefined) ||
            `node_${index}`,
          name: nodeData.name,
          value: node.value || 0,
          depth: node.depth,
          type: 'type' in nodeData && nodeData.type ? nodeData.type : 'root',
          index: index,
          subfieldId: 'subfieldId' in nodeData ? nodeData.subfieldId : undefined,
          topicId: 'topicId' in nodeData ? nodeData.topicId : undefined,
        });
      });
      return flattened;
    }

    function overallLayout(params: echarts.CustomSeriesRenderItemParams, api: echarts.CustomSeriesRenderItemAPI) {
      const context = (params.context as unknown) as RenderContext;

      if (!context.nodes) {
        context.nodes = {};
      }

      const hierarchy = createHierarchy();

      displayRoot = d3
        .pack<SimpleNode | HierarchyData>()
        .size([api.getWidth() - 2, api.getHeight() - 2])
        .padding(3)(hierarchy);

      context.nodes = {};
      displayRoot.descendants().forEach((node, index) => {
        const nodeData = node.data;
        const nodeId = ('subfieldId' in nodeData ? nodeData.subfieldId : undefined) ||
          ('topicId' in nodeData ? nodeData.topicId : undefined) ||
          `node_${index}`;
        context.nodes[nodeId] = node;
      });
    }

    function renderItem(params: echarts.CustomSeriesRenderItemParams, api: echarts.CustomSeriesRenderItemAPI) {
      const context = (params.context as unknown) as RenderContext;

      if (!context.nodes) {
        context.nodes = {};
      }

      if (!context.layout) {
        context.layout = true;
        overallLayout(params, api);
      }

      const nodePath = api.value('id') as string;
      const node = context.nodes[nodePath];
      if (!node) {
        return null;
      }

      const isLeaf = !node.children || !node.children.length;
      const focus = new Uint32Array(
        node.descendants().map((n, i) => i)
      );

      const nodeName = isLeaf
        ? nodePath
          .slice(nodePath.lastIndexOf('.') + 1)
          .split(/(?=[A-Z][^A-Z])/g)
          .join('\n')
        : '';

      const z2 = ((api.value('depth') as number) || 0) * 2;

      return {
        type: 'circle',
        focus: focus,
        shape: {
          cx: node.x,
          cy: node.y,
          r: node.r
        },
        transition: ['shape'],
        z2: z2,
        textContent: {
          type: 'text',
          style: {
            text: nodeName,
            fontFamily: 'Arial',
            width: node.r * 1.3,
            overflow: 'truncate',
            fontSize: node.r / 3
          },
          emphasis: {
            style: {
              overflow: null,
              fontSize: Math.max(node.r / 3, 12)
            }
          }
        },
        textConfig: {
          position: 'inside'
        },
        style: {
          fill: api.visual('color') as string
        },
        emphasis: {
          style: {
            fontFamily: 'Arial',
            fontSize: 12,
            shadowBlur: 20,
            shadowOffsetX: 3,
            shadowOffsetY: 5,
            shadowColor: 'rgba(0,0,0,0.3)'
          }
        }
      };
    }

    function drillDown(targetNodeId?: string) {
      let hierarchyToUse = createHierarchy();

      if (targetNodeId != null) {
        const found = hierarchyToUse.descendants().find(
          (node) => {
            const nodeData = node.data;
            const nodeId = ('subfieldId' in nodeData ? nodeData.subfieldId : undefined) ||
              ('topicId' in nodeData ? nodeData.topicId : undefined);
            return nodeId === targetNodeId;
          }
        );
        if (found) {
          hierarchyToUse = d3.hierarchy(found.data)
            .sum((d) => {
              if (d && typeof d === 'object' && 'value' in d && typeof d.value === 'number') {
                return d.value;
              }
              return 0;
            })
            .sort((a, b) => (b.value || 0) - (a.value || 0));
        }
      }

      displayRoot = d3
        .pack<SimpleNode | HierarchyData>()
        .size([width - 2, height - 2])
        .padding(3)(hierarchyToUse);

      const seriesData = flattenHierarchy(displayRoot);
      circleChart.setOption({
        dataset: {
          source: seriesData,
        },
      });
    }

    displayRoot = d3
      .pack<SimpleNode | HierarchyData>()
      .size([width - 2, height - 2])
      .padding(3)(createHierarchy());

    const seriesData = flattenHierarchy(displayRoot);

    const option: echarts.EChartsOption = {
      dataset: {
        source: seriesData,
      },
      tooltip: {
        formatter: (params) => {
          const data = params as echarts.DefaultLabelFormatterCallbackParams & { data: FlattenedNode };
          return `${data.data.name}<br/>Value: ${data.data.value}`;
        }
      },
      visualMap: [
        {
          show: false,
          min: 0,
          max: 3,
          dimension: 4,
          inRange: {
            color: ['#006edd', '#4a90e2', '#7bb3f0', '#e0ffff'],
          },
        },
      ],
      hoverLayerThreshold: Infinity,
      series: {
        type: 'custom',
        renderItem: renderItem as echarts.CustomSeriesRenderItem,
        progressive: 0,
        coordinateSystem: 'none',
        encode: {
          tooltip: 'value',
          itemName: 'name',
        },
      },
    };

    circleChart.setOption(option);

    circleChart.on('click', { seriesIndex: 0 }, function (params) {
      const data = params.data as FlattenedNode;
      drillDown(data.id);
    });

    circleChart.getZr().on('click', function (event) {
      if (!event.target) {
        drillDown(); // Reset to root
      }
    });

    return () => {
      circleChart.dispose();
    };
  }, [data, width, height]);

  return <div id="chartContainer" style={{ width, height }} />;
};

export default Chart;