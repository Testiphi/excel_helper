import { useMemo, useState } from "react";
import { buildGrid, searchAxis } from "../services/filterEngine";
import { GridCell, SearchQuery, WorkbookData } from "../types";

/**
 * 管理行/列两个维度的锚点搜索条件，并计算交叉定位结果。
 * 结果通过 useMemo 缓存，仅在数据或条件变化时重算。
 */
export function useSearch(data: WorkbookData) {
  const [rowQueries, setRowQueries] = useState<SearchQuery[]>([]);
  const [colQueries, setColQueries] = useState<SearchQuery[]>([]);

  const { rowResult, colResult, grid } = useMemo(() => {
    const rowResult = searchAxis(data, "row", rowQueries);
    const colResult = searchAxis(data, "col", colQueries);
    const grid: GridCell[][] = buildGrid(
      data,
      rowResult.indexes,
      colResult.indexes,
      colResult.anchors
    );
    return { rowResult, colResult, grid };
  }, [data, rowQueries, colQueries]);

  return {
    rowQueries,
    setRowQueries,
    colQueries,
    setColQueries,
    rowResult,
    colResult,
    grid,
  };
}
