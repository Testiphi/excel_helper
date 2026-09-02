import * as React from "react";
import { Text, makeStyles } from "@fluentui/react-components";
import { EditingCell } from "../types";
import { colToLetter } from "../services/filterEngine";
import { useI18n } from "../i18n";

interface StatusBarProps {
  matchedRows: number;
  matchedCols: number;
  /** 检测到的合并区域数（>0 时显示，用于确认合并区域是否被正确读取） */
  mergedCount: number;
  editing: EditingCell | null;
}

const useStyles = makeStyles({
  root: {
    borderTop: "1px solid #e1dfdd",
    paddingTop: "8px",
    display: "flex",
    justifyContent: "space-between",
  },
  text: { color: "#666666" },
});

/** 底部状态栏：匹配规模 + 当前定位坐标 */
const StatusBar: React.FC<StatusBarProps> = ({
  matchedRows,
  matchedCols,
  mergedCount,
  editing,
}) => {
  const styles = useStyles();
  const { t } = useI18n();
  return (
    <div className={styles.root}>
      <Text size={200} className={styles.text}>
        {t("matched", { rows: matchedRows, cols: matchedCols })}
        {mergedCount > 0 ? t("mergedCount", { n: mergedCount }) : ""}
      </Text>
      <Text size={200} className={styles.text}>
        {editing
          ? t("currentCell", {
              row: editing.rowIndex,
              col: colToLetter(editing.colIndex),
            })
          : t("notLocated")}
      </Text>
    </div>
  );
};

export default StatusBar;
