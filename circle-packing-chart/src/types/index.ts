// This file exports TypeScript types and interfaces used throughout the project.

export interface SimpleNode {
  name: string;
  value?: number;
  children?: SimpleNode[];
  subfieldId?: string;
  topicId?: string;
  type?: string;
}