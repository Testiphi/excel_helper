import {
  AxisSearchResult,
  CellValue,
  GridCell,
  MergedRegion,
  SearchQuery,
  WorkbookData,
} from "../types";

/**
 * 定位引擎：纯函数集合，不依赖 Office.js，可单独单元测试。
 * 核心思路：二维锚点定位 —— 行/列两个维度各自按单元格文本搜索，
 * 收集"包含该文本的单元格"所在的轴索引，多条件做集合交并，
 * 两个维度的轴索引做笛卡尔积得到交叉结果。
 * 合并单元格：值只存于左上角，命中左上角时按跨度扩展轴索引；
 * 结果网格中落在合并区域内的格显示左上角的值（与 Excel 视觉一致）。
 * 内部使用 0-based 索引（对应 WorkbookData.rows）；输出给 UI 的坐标均为 Excel 1-based。
 */

/** 列号（1-based）→ Excel 列字母，如 1→A、27→AA */
export function colToLetter(n: number): string {
  let s = "";
  let v = n;
  while (v > 0) {
    const rem = (v - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    v = Math.floor((v - 1) / 26);
  }
  return s;
}

/** Excel 列字母 → 列号（1-based），如 "A"→1、"AA"→27 */
export function letterToCol(s: string): number {
  let n = 0;
  for (const ch of s.toUpperCase()) {
    n = n * 26 + (ch.charCodeAt(0) - 64);
  }
  return n;
}

/** 返回包含指定单元格（0-based）的合并区域（若有） */
export function findMergedRegion(
  data: WorkbookData,
  rowIdx: number,
  colIdx: number
): MergedRegion | undefined {
  return data.mergedRegions.find(
    (r) =>
      rowIdx >= r.startRow &&
      rowIdx <= r.endRow &&
      colIdx >= r.startCol &&
      colIdx <= r.endCol
  );
}

function cellText(v: CellValue): string {
  return v === null || v === undefined ? "" : String(v);
}

function matchCell(cell: CellValue, query: SearchQuery): boolean {
  const text = cellText(cell);
  const target = query.value.trim();
  if (query.mode === "exact") {
    return text.toLowerCase() === target.toLowerCase();
  }
  return text.toLowerCase().includes(target.toLowerCase());
}

/**
 * 维度搜索：扫描全表，收集匹配单元格所在的行（或列）的轴索引。
 * 命中合并区域左上角时，轴索引按跨度扩展（该文本覆盖整个合并区域）。
 * 多条件逻辑：连续 AND 的条件合为一组（组内取交集），OR 分隔的各组之间取并集。
 * 空文本条件视为不存在；所有条件为空时返回空结果（不展开全表）。
 */
export function searchAxis(
  data: WorkbookData,
  dimension: "row" | "col",
  queries: SearchQuery[]
): AxisSearchResult {
  const active = queries.filter((q) => q.value.trim() !== "");
  if (data.rows.length === 0 || active.length === 0) {
    return { indexes: [], anchors: {} };
  }

  // 每个条件独立扫描，得到各自的轴索引集合与锚文本
  const sets: { set: Set<number>; anchors: Record<number, string> }[] = active.map(
    (q) => {
      const set = new Set<number>();
      const anchors: Record<number, string> = {};
      const addAxis = (axis: number, text: string) => {
        if (!set.has(axis)) anchors[axis] = text;
        set.add(axis);
      };

      data.rows.forEach((row, i) => {
        row.forEach((cell, j) => {
          if (matchCell(cell, q)) {
            const text = cellText(cell);
            // 命中格若位于某合并区域内，按区域跨度扩展轴索引。
            // 值只存于左上角，但用"包含"而非"等于左上角"判断，对坐标偏差更稳健。
            const region = findMergedRegion(data, i, j);
            if (region && dimension === "row") {
              for (let ri = region.startRow; ri <= region.endRow; ri++) {
                addAxis(ri, text);
              }
            } else if (region && dimension === "col") {
              for (let ci = region.startCol; ci <= region.endCol; ci++) {
                addAxis(ci, text);
              }
            } else {
              addAxis(dimension === "row" ? i : j, text);
            }
          }
        });
      });
      return { set, anchors };
    }
  );

  // AND/OR 分组：AND 并入当前组（交集），OR 新开一组，组间取并集
  const groups: { set: Set<number>; anchors: Record<number, string> }[] = [];
  sets.forEach((item, idx) => {
    if (idx === 0 || active[idx].logic === "OR") {
      groups.push({ set: new Set(item.set), anchors: { ...item.anchors } });
    } else {
      const g = groups[groups.length - 1];
      for (const v of [...g.set]) {
        if (!item.set.has(v)) g.set.delete(v);
      }
      for (const [k, v] of Object.entries(item.anchors)) {
        if (g.anchors[Number(k)] === undefined) g.anchors[Number(k)] = v;
      }
    }
  });

  const union = new Set<number>();
  const anchors: Record<number, string> = {};
  groups.forEach((g) => {
    g.set.forEach((v) => {
      union.add(v);
      if (anchors[v] === undefined) anchors[v] = g.anchors[v];
    });
  });

  return { indexes: [...union].sort((a, b) => a - b), anchors };
}

/** 取单元格显示值：合并区域内非左上角的格显示左上角的值 */
function mergedValue(data: WorkbookData, rowIdx: number, colIdx: number): CellValue {
  const v = data.rows[rowIdx]?.[colIdx];
  if (v !== null && v !== undefined) return v;
  const region = findMergedRegion(data, rowIdx, colIdx);
  if (region) {
    return data.rows[region.startRow]?.[region.startCol] ?? null;
  }
  return v ?? null;
}

/** 交叉定位：匹配行 × 匹配列 → 结果网格（GridCell 二维数组，一维 = 行） */
export function buildGrid(
  data: WorkbookData,
  matchedRowIndexes: number[],
  matchedColIndexes: number[],
  colAnchors: Record<number, string>
): GridCell[][] {
  return matchedRowIndexes.map((rowIdx) =>
    matchedColIndexes.map((colIdx) => ({
      rowIndex: rowIdx + 1, // 0-based → Excel 行号（无表头假设，首行即第 1 行）
      colIndex: colIdx + 1,
      colName: colAnchors[colIdx] ?? "",
      value: mergedValue(data, rowIdx, colIdx),
    }))
  );
}
