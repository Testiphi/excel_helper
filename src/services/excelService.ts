import { MergedRegion, WorkbookData } from "../types";
import { letterToCol } from "./filterEngine";

/**
 * Excel 数据读写服务：封装 Office.js API。
 * 所有方法必须在 add-in 任务窗格内调用（Excel 宿主环境）。
 * 行号/列号参数均使用 Excel 1-based 坐标。
 */

/**
 * 读取活动工作表的整个使用区域与全部合并区域，不做任何表头假设。
 * 合并单元格的值只存于左上角，因此附带合并区域列表供引擎做跨度扩展与值复制。
 * 合并区域读取独立成一次 Excel.run：失败（如合并区域超过 512 个）时降级为空列表，
 * 不影响主数据加载；检测结果写入 console，便于排查。
 */
export async function getWorkbookData(): Promise<WorkbookData> {
  const rows = await readUsedValues();
  const mergedRegions = await readMergedRegions();
  return { rows, mergedRegions };
}

function readUsedValues(): Promise<WorkbookData["rows"]> {
  return Excel.run(async (context) => {
    const usedRange = context.workbook.worksheets
      .getActiveWorksheet()
      .getUsedRange();
    usedRange.load("values");
    await context.sync();
    return (usedRange.values ?? []) as WorkbookData["rows"];
  });
}

/**
 * 解析单个单元格地址（如 "A2"、"Sheet1!A2"、"'Sheet 1'!$A$2"）为 1-based 行列坐标。
 */
function parseAddress(addr: string): { row: number; col: number } {
  const cleaned = addr
    .trim()
    .replace(/^.*?!/, "") // 去掉工作表前缀：'Sheet 1'! 或 Sheet1!
    .replace(/\$/g, "")
    .split(/[\s,:]/)[0]; // 多区域/多范围时取首个
  const m = cleaned.match(/^([A-Z]+)(\d+)$/);
  if (!m) return { row: 1, col: 1 };
  return { col: letterToCol(m[1]), row: parseInt(m[2], 10) };
}

/**
 * 由区域对象构建合并区域（0-based）。
 * 注意：地址可能只含左上角锚点格（如 "Sheet1!A14"），跨度必须用 rowCount/columnCount 取。
 */
function regionFromArea(area: Excel.Range): MergedRegion {
  const topLeft = parseAddress(area.address);
  return {
    startRow: topLeft.row - 1,
    endRow: topLeft.row - 1 + (area.rowCount - 1),
    startCol: topLeft.col - 1,
    endCol: topLeft.col - 1 + (area.columnCount - 1),
  };
}

/** 是否含真正的跨度（合并至少 2 个单元格） */
function hasRealSpan(regions: MergedRegion[]): boolean {
  return regions.some((r) => r.endRow > r.startRow || r.endCol > r.startCol);
}

/** 通用读取：对使用区域执行"取合并区域集合"的回调，返回地址与解析结果；失败返回 null */
async function readMergedVia(
  getAreas: (usedRange: Excel.Range) => Excel.RangeCollection | undefined | null
): Promise<{ addresses: string[]; regions: MergedRegion[] } | null> {
  try {
    return await Excel.run(async (context) => {
      const usedRange = context.workbook.worksheets
        .getActiveWorksheet()
        .getUsedRange();
      const areas = getAreas(usedRange);
      if (!areas) return null;
      areas.load(["address", "rowCount", "columnCount"]);
      await context.sync();
      const items = areas.items ?? [];
      return {
        addresses: items.map((r) => r.address),
        regions: items.map(regionFromArea),
      };
    });
  } catch (err) {
    console.warn("[locator] 读取合并区域失败:", err);
    return null;
  }
}

async function readMergedRegions(): Promise<MergedRegion[]> {
  // 首选：getMergedRanges（ExcelApi 1.4，返回完整合并范围）
  const oldResult = await readMergedVia((usedRange) =>
    (
      usedRange as unknown as {
        getMergedRanges?: () => Excel.RangeCollection;
      }
    ).getMergedRanges?.()
  );
  if (oldResult) {
    console.log(`[locator] getMergedRanges 地址: ${JSON.stringify(oldResult.addresses)}`);
    console.log(`[locator] getMergedRanges 区域: ${JSON.stringify(oldResult.regions)}`);
    if (hasRealSpan(oldResult.regions)) return oldResult.regions;
  }

  // 回退：getMergedAreasOrNullObject（ExcelApi 1.13；地址可能只有锚点格，跨度靠 rowCount/columnCount）
  const newResult = await readMergedVia((usedRange) =>
    usedRange.getMergedAreasOrNullObject().areas
  );
  if (newResult) {
    console.log(
      `[locator] getMergedAreasOrNullObject 地址: ${JSON.stringify(newResult.addresses)}`
    );
    console.log(
      `[locator] getMergedAreasOrNullObject 区域: ${JSON.stringify(newResult.regions)}`
    );
    if (hasRealSpan(newResult.regions)) return newResult.regions;
  }

  // 均无跨度信息时，退而求其次用任一组（优先旧 API）
  if (oldResult) return oldResult.regions;
  if (newResult) return newResult.regions;
  return [];
}

/** 将值写回指定单元格 */
export function setCellValue(
  row: number,
  col: number,
  value: string | number | boolean
): Promise<void> {
  return Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    sheet.getCell(row - 1, col - 1).values = [[value]];
    await context.sync();
  });
}

/** 在 Excel 主窗口中选中指定单元格 */
export function selectCell(row: number, col: number): Promise<void> {
  return Excel.run(async (context) => {
    const sheet = context.workbook.worksheets.getActiveWorksheet();
    sheet.getCell(row - 1, col - 1).select();
    await context.sync();
  });
}
