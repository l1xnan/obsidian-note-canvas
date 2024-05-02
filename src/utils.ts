import { HeadingCache } from "obsidian";
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

const WIDTH = 200;
const HEIGHT = 60;
const X_GAP = WIDTH / 2;
const Y_GAP = 30;

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
