import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { WorksSourceMetrics } from './types';
import {
  prepareChartData,
  stratifyData,
  createRenderItem
} from './utils';
import type { CustomSeriesOption } from 'echarts';

interface BubbleChartProps {
  data: WorksSourceMetrics[];
}

export const Chart: React.FC<BubbleChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartRef.current) return;
    const chart = echarts.init(chartRef.current);

    const { seriesData } = prepareChartData(data);
    let displayRoot = stratifyData(seriesData);
    const getRoot = () => displayRoot;
    const renderItem = createRenderItem(getRoot);

    console.log('Chart data prepared:', seriesData);

    const option: echarts.EChartsOption = {
      dataset: { dimensions: ['id', 'value', 'depth', 'index', 'color'], source: seriesData, },
      tooltip: {
        trigger: 'item',
        formatter: function (params) {
          const data = params.data;
          const id: string = data.id;
          const name = id.includes('.') ? id.slice(id.lastIndexOf('.') + 1) : id;
          return `${name}<br/>Total: ${data.value}`;
        },
      },
      series: [
        ({
          type: 'custom',
          renderItem,
          coordinateSystem: 'none',
          progressive: 0
        } as CustomSeriesOption)
      ]
    };

    chart.setOption(option);
    chart.on('click', { seriesIndex: 0 }, (params) => {
      displayRoot = stratifyData(seriesData);
      if (
        params.data &&
        typeof params.data === 'object' &&
        'id' in params.data
      ) {
        const foundNode = displayRoot.descendants().find(
          (n) => n.data.id === (params.data as { id: string }).id
        );
        if (foundNode) {
          displayRoot = foundNode;
          displayRoot.parent = null;
        }
      }
      chart.setOption({ dataset: { source: seriesData } });
    });

    chart.getZr().on('click', (event) => {
      if (!event.target) {
        displayRoot = stratifyData(seriesData);
        chart.setOption({ dataset: { source: seriesData } });
      }
    });

    return () => {
      chart.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={{ width: '100%', height: '400px' }} />;
};