import * as React from "react";
import { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogBody,
  DialogContent,
  DialogSurface,
  DialogTitle,
  Input,
  Text,
  makeStyles,
} from "@fluentui/react-components";
import { EditingCell } from "../types";
import { colToLetter } from "../services/filterEngine";

interface CellEditorProps {
  cell: EditingCell;
  /** 合并区域等写回提示（可选） */
  notice?: string;
  onSave: (value: string | number | boolean) => void;
  onCancel: () => void;
}

const useStyles = makeStyles({
  meta: { display: "flex", flexDirection: "column", gap: "8px" },
  metaText: { color: "#666666" },
  notice: { color: "#9c6500" },
});

/** 单元格编辑弹层：显示原始值，输入新值并写回 Excel。Enter 保存，Esc 取消。 */
const CellEditor: React.FC<CellEditorProps> = ({
  cell,
  notice,
  onSave,
  onCancel,
}) => {
  const styles = useStyles();
  const [value, setValue] = useState(
    cell.currentValue === null ? "" : String(cell.currentValue)
  );

  const save = () => {
    // 骨架阶段：以字符串原样写回；数字/日期等类型转换后续实现
    onSave(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCancel();
    } else if (e.key === "Enter") {
      e.preventDefault();
      save();
    }
  };

  return (
    <Dialog open onOpenChange={(_, data) => { if (!data.open) onCancel(); }}>
      <DialogSurface
        style={{ boxShadow: "none", border: "1px solid #d0d0d0" }}
      >
        <DialogBody>
          <DialogTitle>
            编辑单元格 第{cell.rowIndex}行 {colToLetter(cell.colIndex)}列
          </DialogTitle>
          <DialogContent className={styles.meta}>
            <Text size={200} className={styles.metaText}>
              原始值：
              {cell.currentValue === null || cell.currentValue === undefined
                ? "(空)"
                : String(cell.currentValue)}
            </Text>
            {notice && (
              <Text size={200} className={styles.notice}>
                {notice}
              </Text>
            )}
            <Input
              value={value}
              onChange={(_, data) => setValue(data.value)}
              placeholder="输入新值"
              autoFocus
              onKeyDown={handleKeyDown}
            />
          </DialogContent>
          <DialogActions>
            <Button appearance="outline" onClick={onCancel}>
              取消
            </Button>
            <Button appearance="primary" onClick={save}>
              保存
            </Button>
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};

export default CellEditor;
