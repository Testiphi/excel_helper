import * as React from "react";
import { useState } from "react";
import { makeStyles } from "@fluentui/react-components";
import HeaderBar from "./HeaderBar";
import { RowSearch, ColumnSearch } from "./AxisSearch";
import ResultGrid from "./ResultGrid";
import CellEditor from "./CellEditor";
import StatusBar from "./StatusBar";
import { useWorkbookData } from "../hooks/useWorkbookData";
import { useSearch } from "../hooks/useSearch";
import { setCellValue } from "../services/excelService";
import { colToLetter, findMergedRegion } from "../services/filterEngine";
import { EditingCell, GridCell } from "../types";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "12px",
    minHeight: "100vh",
    boxSizing: "border-box",
    background: "#ffffff",
  },
  error: { color: "#d13438", fontSize: "12px" },
});

/**
 * 根组件：组合 数据加载 → 行/列锚点搜索 → 交叉结果 → 编辑写回 的完整链路。
 * 分层职责：
 *   services  — Office.js 读写 / 纯定位逻辑
 *   hooks     — 数据与搜索状态管理
 *   components— 纯 UI 展示与交互
 */
const App: React.FC = () => {
  const styles = useStyles();
  const { data, loading, error, reload } = useWorkbookData();
  const {
    rowQueries,
    setRowQueries,
    colQueries,
    setColQueries,
    rowResult,
    colResult,
    grid,
  } = useSearch(data);
  const [editing, setEditing] = useState<EditingCell | null>(null);

  const handleEdit = (cell: GridCell) => {
    setEditing({
      rowIndex: cell.rowIndex,
      colIndex: cell.colIndex,
      currentValue: cell.value,
    });
  };

  /** 目标格在合并区域内（非左上角）时，写回重定向到左上角 */
  const writeTarget = () => {
    if (!editing) return null;
    const region = findMergedRegion(
      data,
      editing.rowIndex - 1,
      editing.colIndex - 1
    );
    const isTopLeft =
      region &&
      editing.rowIndex - 1 === region.startRow &&
      editing.colIndex - 1 === region.startCol;
    if (region && !isTopLeft) {
      return { row: region.startRow + 1, col: region.startCol + 1 };
    }
    return { row: editing.rowIndex, col: editing.colIndex };
  };

  /** 合并区域提示文案（仅在非左上角格时显示） */
  const mergeNotice = () => {
    if (!editing) return undefined;
    const region = findMergedRegion(
      data,
      editing.rowIndex - 1,
      editing.colIndex - 1
    );
    if (!region) return undefined;
    const isTopLeft =
      editing.rowIndex - 1 === region.startRow &&
      editing.colIndex - 1 === region.startCol;
    if (isTopLeft) return undefined;
    return `该单元格属于合并区域 ${colToLetter(region.startCol + 1)}${
      region.startRow + 1
    }:${colToLetter(region.endCol + 1)}${region.endRow + 1}，修改将写入左上角`;
  };

  const handleSave = async (value: string | number | boolean) => {
    if (!editing) return;
    try {
      const target = writeTarget();
      if (!target) return;
      await setCellValue(target.row, target.col, value);
      setEditing(null);
      await reload(); // 写回后刷新数据快照
    } catch (err) {
      console.error("写回失败: ", err);
    }
  };

  return (
    <div className={styles.root}>
      <HeaderBar loading={loading} onRefresh={reload} />
      <RowSearch queries={rowQueries} result={rowResult} onChange={setRowQueries} />
      <ColumnSearch
        queries={colQueries}
        result={colResult}
        onChange={setColQueries}
      />
      {error && <div className={styles.error}>加载失败: {error}</div>}
      <ResultGrid grid={grid} onEdit={handleEdit} />
      <StatusBar
        matchedRows={rowResult.indexes.length}
        matchedCols={colResult.indexes.length}
        mergedCount={data.mergedRegions.length}
        editing={editing}
      />
      {editing && (
        <CellEditor
          cell={editing}
          notice={mergeNotice()}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
};

export default App;
