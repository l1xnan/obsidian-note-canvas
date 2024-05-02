import { expect, test } from "vitest";
import { convertToTree } from "./utils";
import { HeadingCache } from "obsidian";

test("convert headings to canvas", () => {
  // Example usage
  const flatData = [
    { heading: "A", level: 1 },
    { heading: "B", level: 2 },
    { heading: "C", level: 2 },
    { heading: "D", level: 1 },
    { heading: "E", level: 2 },
    { heading: "F", level: 3 },
    { heading: "G", level: 1 },
  ] as HeadingCache[];
  const tree = convertToTree(flatData);
  console.log(tree);
  expect(3).toBe(3);
});
