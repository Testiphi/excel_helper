import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { makeStyles } from "@fluentui/react-components";
import { GridCell } from "../types";
import { colToLetter } from "../services/filterEngine";

interface ResultGridProps {
  grid: GridCell[][];
  onEdit: (cell: GridCell) => void;
}

const useStyles = makeStyles({
  root: { flex: 1, overflow: "auto", outline: "none" },
  table: { borderCollapse: "collapse", width: "100%", fontSize: "12px" },
  th: {
    border: "1px solid #d0d0d0",
    background: "#f2f2f2",
    padding: "4px 8px",
    textAlign: "left",
    position: "sticky",
    top: 0,
    fontWeight: 600,
    color: "#333333",
  },
  td: {
    border: "1px solid #d0d0d0",
    padding: "4px 8px",
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  active: {
    outline: "1px solid #0078d4",
    outlineOffset: "-1px",
    background: "#f3f9fd",
  },
  rowNum: {
    background: "#f2f2f2",
    color: "#666666",
    textAlign: "center",
    cursor: "default",
  },
  empty: {
    color: "#888888",
    padding: "16px",
    textAlign: "center",
    fontSize: "12px",
  },
});

/**
 * 交叉定位结果网格：匹配行 × 匹配列。
 * 交互：单击选中当前格，↑↓←→ 移动，Enter/双击进入编辑，Esc 取消选中。
 */
const ResultGrid: React.FC<ResultGridProps> = ({ grid, onEdit }) => {
  const styles = useStyles();
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<{ r: number; c: number } | null>(null);

  // 结果变化时清除当前选中格
  useEffect(() => {
    setActive(null);
  }, [grid]);

  if (grid.length === 0) {
    return (
      <div className={styles.empty}>
        未定位：请在行搜索、列搜索中分别输入文本
      </div>
    );
  }

  const rows = grid.length;
  const cols = grid[0].length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!active) return;
    const { r, c } = active;
    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        if (r > 0) setActive({ r: r - 1, c });
        break;
      case "ArrowDown":
        e.preventDefault();
        if (r < rows - 1) setActive({ r: r + 1, c });
        break;
      case "ArrowLeft":
        e.preventDefault();
        if (c > 0) setActive({ r, c: c - 1 });
        break;
      case "ArrowRight":
        e.preventDefault();
        if (c < cols - 1) setActive({ r, c: c + 1 });
        break;
      case "Enter":
        e.preventDefault();
        onEdit(grid[r][c]);
        break;
      case "Escape":
        e.preventDefault();
        setActive(null);
        break;
      default:
        break;
    }
  };

  const select = (r: number, c: number) => {
    setActive({ r, c });
    rootRef.current?.focus();
  };

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      className={styles.root}
      onKeyDown={handleKeyDown}
      onBlur={() => setActive(null)}
    >
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th} style={{ width: "48px" }}>
              行号
            </th>
            {grid[0].map((cell, i) => (
              <th key={i} className={styles.th}>
                {colToLetter(cell.colIndex)}
                {cell.colName ? `(${cell.colName})` : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {grid.map((rowCells, i) => (
            <tr key={i}>
              <td
                className={`${styles.td} ${styles.rowNum}`}
                onClick={() => select(i, 0)}
              >
                {rowCells[0]?.rowIndex}
              </td>
              {rowCells.map((cell, j) => (
                <td
                  key={j}
                  className={`${styles.td}${
                    active?.r === i && active?.c === j ? ` ${styles.active}` : ""
                  }`}
                  title="单击选中，双击或 Enter 编辑"
                  onClick={() => select(i, j)}
                  onDoubleClick={() => onEdit(cell)}
                >
                  {cell.value === null || cell.value === undefined
                    ? ""
                    : String(cell.value)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultGrid;
