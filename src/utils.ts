import { CachedMetadata, HeadingCache } from "obsidian";
import { CanvasPluginSettings } from "./main";

export interface TextNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "text";
  text: string;
  color?: string;
}
export interface FileNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: "file";
  file: string;
  color?: string;
}

export interface Edge {
  id: string;
  fromNode: string;
  fromSide: "left" | "right" | "top" | "bottom";
  toNode: string;
  toSide: "left" | "right" | "top" | "bottom";
}

export interface Canvas {
  nodes: TextNode[];
  edges: Edge[];
}

export type TreeNode = HeadingCache & {
  children?: TreeNode[];
};
export type ItemType = {
  id: string;
  pid: string;
  text: string;
  level: number;
  x: number;
  y: number;
};

const WIDTH = 200;
const HEIGHT = 60;
const X_GAP = WIDTH / 2;
const Y_GAP = 30;

export function convertToCache(
  cache: CachedMetadata,
  data: string,
  config: CanvasPluginSettings = {
    width: WIDTH,
    height: HEIGHT,
  },
  title: string
) {
  const { headings = [], sections = [] } = cache;

  const { width: WIDTH } = config;
  const levels: number[] = new Array(6).fill(0);
  levels[0] = 1;

  let yAxis = 0;
  const edges: Edge[] = [];

  let head = 0;

  const items: ItemType[] = [
    {
      id: "1",
      pid: "",
      text: title,
      level: 1,
      x: 1,
      y: 0,
    },
  ];
  let last_level = 0;
  let last_s = 0;
  sections.forEach(({ type, position }) => {
    if (type === "heading") {
      const { level, heading } = headings[head];

      levels[level - 1] += 1;
      if (levels[level - 1] > 1 || last_s > 0) {
        yAxis += 1;
      }
      levels.fill(0, level);

      const id = levels.slice(0, level).join("-");
      const pid = levels.slice(0, level - 1).join("-");

      items.push({
        id,
        pid,
        text: heading,
        level,
        x: level,
        y: yAxis,
      });
      head += 1;
      last_level = level;
      last_s = 0;
    } else {
      const { start, end } = position;
      if (last_s > 0) {
        yAxis += 1;
      }
      last_s += 1;
      const pid = levels.slice(0, last_level).join("-");
      const id = `${pid}-s${last_s}`;
      const text = data.slice(start.offset, end.offset);
      items.push({
        id,
        pid,
        text,
        x: last_level + 1,
        y: yAxis,
        level: last_level + 1,
      });
    }
    const { pid, id } = items.at(-1)!;
    edges.push({
      id: `${pid}/${id}`,
      fromNode: pid,
      fromSide: "right",
      toNode: id,
      toSide: "left",
    });
  });

  const nodes = items.map(
    ({ x, y, id, text }) =>
      ({
        id,
        text,
        type: "text",
        x: x * (WIDTH + X_GAP),
        y: y * (HEIGHT + Y_GAP),
        height: HEIGHT,
        width: WIDTH,
      } as TextNode)
  );

  return { nodes, edges };
}

export function convertToTree(
  headings: HeadingCache[],
  config: CanvasPluginSettings = {
    width: WIDTH,
    height: HEIGHT,
  }
) {
  const { width: WIDTH } = config;
  const levels: number[] = new Array(6).fill(0);

  let yAxis = 0;
  const edges: Edge[] = [];
  const items = headings.map(({ level, heading }, i) => {
    levels[level - 1] += 1;
    if (levels[level - 1] > 1) {
      yAxis += 1;
    }
    levels.fill(0, level);
    console.log(levels, heading);
    const id = levels.slice(0, level).join("-");
    const pid = levels.slice(0, level - 1).join("-");
    edges.push({
      id: `${pid}/${id}`,
      fromNode: pid,
      fromSide: "right",
      toNode: id,
      toSide: "left",
    });
    return {
      id: levels.slice(0, level).join("-"),
      pid: levels.slice(0, level - 1).join("-"),
      text: heading,
      level,
      x: level,
      y: yAxis,
    };
  });

  const nodes = items.map(
    ({ x, y, id, text }) =>
      ({
        id,
        text,
        type: "text",
        x: x * (WIDTH + X_GAP),
        y: y * (HEIGHT + Y_GAP),
        height: HEIGHT,
        width: WIDTH,
      } as TextNode)
  );

  return { nodes, edges };
}
