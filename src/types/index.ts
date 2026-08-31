// 核心领域类型定义：贯穿 services / hooks / components 各层

/** 单元格的通用值类型（对应 Office.js values 数组的元素） */
export type CellValue = string | number | boolean | null;

/** 合并区域（0-based 索引，含两端；与 WorkbookData.rows 同坐标系） */
export interface MergedRegion {
  startRow: number;
  endRow: number;
  startCol: number;
  endCol: number;
}

/** 工作簿数据快照：整个使用区域，不含任何表头假设（多表头/异常格式均按普通数据对待） */
export interface WorkbookData {
  /** 数据行：rows[i][j] 对应 Excel 第 (i+1) 行第 (j+1) 列 */
  rows: CellValue[][];
  /** 当前工作表的合并区域列表 */
  mergedRegions: MergedRegion[];
}

/** 单个锚点搜索条件：在行或列维度上按单元格文本定位 */
export interface SearchQuery {
  id: string;
  /** 搜索文本 */
  value: string;
  /** 与上一条条件的逻辑关系（第一条条件忽略此字段） */
  logic: "AND" | "OR";
  /** 匹配方式 */
  mode: "contains" | "exact";
}

/** 一个维度的搜索结果 */
export interface AxisSearchResult {
  /** 匹配的轴索引（0-based：行号或列号） */
  indexes: number[];
  /** 轴索引 → 首个匹配的单元格文本（用于界面展示） */
  anchors: Record<number, string>;
}

/** 交叉定位结果中的一个单元格（行号/列号均为 Excel 1-based 坐标） */
export interface GridCell {
  /** Excel 行号（1-based） */
  rowIndex: number;
  /** Excel 列号（1-based） */
  colIndex: number;
  /** 该列命中的锚点文本（用于展示，可为空） */
  colName: string;
  /** 单元格当前值 */
  value: CellValue;
}

/** 当前正在编辑的单元格 */
export interface EditingCell {
  rowIndex: number;
  colIndex: number;
  currentValue: CellValue;
}
