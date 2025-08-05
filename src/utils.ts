import type { DataItem, ColorConfig } from "./types";

// Generate colors for subfields
export const generateSubfieldColors = (subfields: string[]): ColorConfig => {
  const colors: ColorConfig = {};
  const baseColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
  ];

  subfields.forEach((subfieldId, index) => {
    colors[subfieldId] = baseColors[index % baseColors.length];
  });

  return colors;
};

// Transform flat data to simple hierarchy
export const transformDataToHierarchy = (data: DataItem[]) => {
  const subfieldGroups = data.reduce((acc, item) => {
    if (!acc[item.subfieldId]) {
      acc[item.subfieldId] = [];
    }
    acc[item.subfieldId].push(item);
    return acc;
  }, {} as Record<string, DataItem[]>);

  return Object.entries(subfieldGroups).map(([subfieldId, items]) => ({
    name: items[0].subfieldName,
    subfieldId,
    type: "subfield" as const,
    children: items.map((item) => ({
      name: item.topicName,
      value: item.workCount,
      topicId: item.topicId,
      type: "topic" as const,
    })),
  }));
};

// Get unique subfield IDs
export const getUniqueSubfields = (data: DataItem[]): string[] => {
  return Array.from(new Set(data.map((item) => item.subfieldId)));
};
