import * as React from "react";
import { createContext, useCallback, useContext, useState } from "react";

/**
 * 轻量 i18n：中/英文案字典 + React Context。
 * 语言选择持久化到 localStorage（key: cross-locator-locale），默认中文。
 * t(key, vars) 支持 {name} 占位符插值。
 */

export type Locale = "zh" | "en";

const dict = {
  zh: {
    appTitle: "Excel 交叉定位",
    langLabel: "English",
    refresh: "刷新",
    rowSearch: "行搜索",
    colSearch: "列搜索",
    logicAnd: "且",
    logicOr: "或",
    modeContains: "包含",
    modeEquals: "等于",
    searchPlaceholder: "输入文本",
    addCondition: "添加条件",
    removeCondition: "删除条件",
    listSep: "、",
    matches: "匹配 {n} 项: {list}",
    noMatches: "未匹配到任何内容",
    searchHint: "输入文本，定位包含该内容的行/列",
    rowLabel: "第{row}行{anchor}",
    colLabel: "{letter}列{anchor}",
    rowHeader: "行号",
    gridEmpty: "未定位：请在行搜索、列搜索中分别输入文本",
    editTitle: "编辑单元格 第{row}行 {col}列",
    originalValue: "原始值：{value}",
    emptyValue: "(空)",
    newValuePlaceholder: "输入新值",
    cancel: "取消",
    save: "保存",
    mergeNotice:
      "该单元格属于合并区域 {range}，修改将写入左上角",
    matched: "匹配 {rows} 行 × {cols} 列",
    mergedCount: " · 合并区域 {n} 处",
    currentCell: "当前定位: 第 {row} 行 {col} 列",
    notLocated: "未定位",
    loadError: "加载失败: {msg}",
  },
  en: {
    appTitle: "Excel Cross-Locator",
    langLabel: "中文",
    refresh: "Refresh",
    rowSearch: "Row search",
    colSearch: "Column search",
    logicAnd: "AND",
    logicOr: "OR",
    modeContains: "Contains",
    modeEquals: "Equals",
    searchPlaceholder: "Enter text",
    addCondition: "Add condition",
    removeCondition: "Remove condition",
    listSep: ", ",
    matches: "{n} match(es): {list}",
    noMatches: "No matches",
    searchHint: "Enter text to find rows/columns containing it",
    rowLabel: "Row {row}{anchor}",
    colLabel: "Col {letter}{anchor}",
    rowHeader: "Row",
    gridEmpty: "No results: enter text in both row and column search",
    editTitle: "Edit cell Row {row}, Col {col}",
    originalValue: "Original value: {value}",
    emptyValue: "(empty)",
    newValuePlaceholder: "Enter new value",
    cancel: "Cancel",
    save: "Save",
    mergeNotice:
      "This cell belongs to merged region {range}; the change will be written to the top-left cell",
    matched: "{rows} rows × {cols} cols matched",
    mergedCount: " · {n} merged region(s)",
    currentCell: "Current: Row {row}, Col {col}",
    notLocated: "Not located",
    loadError: "Load failed: {msg}",
  },
} as const;

export type MessageKey = keyof typeof dict.zh;

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function fmt(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, k) =>
    k in vars ? String(vars[k]) : m
  );
}

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const saved = localStorage.getItem("cross-locator-locale");
    return saved === "en" || saved === "zh" ? saved : "zh";
  });

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    localStorage.setItem("cross-locator-locale", next);
  }, []);

  const t = useCallback(
    (key: MessageKey, vars?: Record<string, string | number>) =>
      fmt(dict[locale][key], vars),
    [locale]
  );

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useI18n(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useI18n must be used within LocaleProvider");
  return ctx;
}
