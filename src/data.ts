export interface DataItem {
  subfieldId: string;
  subfieldName: string;
  topicId: string;
  topicName: string;
  workCount: number;
}

export const sampleData: DataItem[] = [
  {
    subfieldId: "sf1",
    subfieldName: "Machine Learning",
    topicId: "t1",
    topicName: "Neural Networks",
    workCount: 150,
  },
  {
    subfieldId: "sf1",
    subfieldName: "Machine Learning",
    topicId: "t2",
    topicName: "Deep Learning",
    workCount: 200,
  },
  {
    subfieldId: "sf1",
    subfieldName: "Machine Learning",
    topicId: "t3",
    topicName: "Reinforcement Learning",
    workCount: 80,
  },
  {
    subfieldId: "sf2",
    subfieldName: "Computer Vision",
    topicId: "t4",
    topicName: "Image Recognition",
    workCount: 120,
  },
  {
    subfieldId: "sf2",
    subfieldName: "Computer Vision",
    topicId: "t5",
    topicName: "Object Detection",
    workCount: 90,
  },
  {
    subfieldId: "sf3",
    subfieldName: "Natural Language Processing",
    topicId: "t6",
    topicName: "Language Models",
    workCount: 180,
  },
  {
    subfieldId: "sf3",
    subfieldName: "Natural Language Processing",
    topicId: "t7",
    topicName: "Sentiment Analysis",
    workCount: 70,
  },
  {
    subfieldId: "sf4",
    subfieldName: "Robotics",
    topicId: "t8",
    topicName: "Autonomous Systems",
    workCount: 100,
  },
  {
    subfieldId: "sf4",
    subfieldName: "Robotics",
    topicId: "t9",
    topicName: "Motion Planning",
    workCount: 60,
  },
];
