import { useCallback, useEffect, useState } from "react";
import { getWorkbookData } from "../services/excelService";
import { WorkbookData } from "../types";

/**
 * 加载活动工作表数据，暴露 loading / error / reload。
 * 组件挂载时自动加载一次；写回编辑后调用 reload 刷新。
 */
export function useWorkbookData() {
  const [data, setData] = useState<WorkbookData>({ rows: [], mergedRegions: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await getWorkbookData());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, reload };
}
