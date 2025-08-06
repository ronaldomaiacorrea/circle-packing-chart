export interface WorksSourceMetrics {
  subfieldId: string;
  subfieldName: string;
  topicId: string;
  topicName: string;
  workCount: number;
}

export interface ChartNode {
  id: string;
  value: number;
  depth: number;
  index: number;
  color: string;
}
