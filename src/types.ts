// Original data format from your API/source
export interface DataItem {
  subfieldId: string;
  subfieldName: string;
  topicId: string;
  topicName: string;
  workCount: number;
}

// Simple hierarchical structure for D3
export interface SimpleNode {
  name: string;
  value?: number;
  children?: SimpleNode[];
  subfieldId?: string;
  topicId?: string;
  type?: "subfield" | "topic";
}

// Color configuration
export interface ColorConfig {
  [subfieldId: string]: string;
}
