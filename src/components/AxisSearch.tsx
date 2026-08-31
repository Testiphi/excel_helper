import * as React from "react";
import {
  Button,
  Dropdown,
  Input,
  Option,
  Text,
  makeStyles,
} from "@fluentui/react-components";
import { Add24Regular, Dismiss24Regular } from "@fluentui/react-icons";
import { AxisSearchResult, SearchQuery } from "../types";
import { colToLetter } from "../services/filterEngine";

interface SearchPanelProps {
  title: string;
  queries: SearchQuery[];
  result: AxisSearchResult;
  onChange: (queries: SearchQuery[]) => void;
  /** 将轴索引（0-based）格式化为展示文本，如 "第3行" / "C列" */
  matchLabel: (index: number, anchor: string) => string;
}

let nextQueryId = 0;
function newQuery(): SearchQuery {
  return { id: `q-${nextQueryId++}`, value: "", logic: "AND", mode: "contains" };
}

const useStyles = makeStyles({
  root: { display: "flex", flexDirection: "column", gap: "6px" },
  row: { display: "flex", gap: "6px", alignItems: "center" },
  add: { alignSelf: "flex-start" },
  matchInfo: { color: "#666666", fontSize: "12px" },
});

/**
 * 锚点搜索面板：一个维度（行或列）的多条件搜索。
 * 条件之间按 且/或 组合；下方展示当前匹配的轴索引列表，供用户确认。
 */
const SearchPanel: React.FC<SearchPanelProps> = ({
  title,
  queries,
  result,
  onChange,
  matchLabel,
}) => {
  const styles = useStyles();
  const hasActive = queries.some((q) => q.value.trim() !== "");

  const update = (id: string, patch: Partial<SearchQuery>) => {
    onChange(queries.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };
  const remove = (id: string) => {
    onChange(queries.filter((q) => q.id !== id));
  };
  const add = () => {
    onChange([...queries, newQuery()]);
  };

  const matchText =
    result.indexes.length > 0
      ? `匹配 ${result.indexes.length} 项: ${result.indexes
          .map((i) => matchLabel(i, result.anchors[i]))
          .join("、")}`
      : hasActive
        ? "未匹配到任何内容"
        : "输入文本，定位包含该内容的行/列";

  return (
    <div className={styles.root}>
      <Text size={200} weight="semibold">
        {title}
      </Text>
      {queries.map((q, idx) => (
        <div key={q.id} className={styles.row}>
          {idx > 0 && (
            <Dropdown
              aria-label="逻辑关系"
              value={q.logic}
              selectedOptions={[q.logic]}
              onOptionSelect={(_, d) =>
                update(q.id, { logic: d.optionValue as "AND" | "OR" })
              }
              style={{ minWidth: "56px" }}
            >
              <Option value="AND">且</Option>
              <Option value="OR">或</Option>
            </Dropdown>
          )}
          <Dropdown
            aria-label="匹配方式"
            value={q.mode}
            selectedOptions={[q.mode]}
            onOptionSelect={(_, d) =>
              update(q.id, { mode: d.optionValue as "contains" | "exact" })
            }
            style={{ minWidth: "72px" }}
          >
            <Option value="contains">包含</Option>
            <Option value="exact">等于</Option>
          </Dropdown>
          <Input
            aria-label="搜索文本"
            placeholder="输入文本"
            value={q.value}
            onChange={(_, d) => update(q.id, { value: d.value })}
            style={{ flex: 1 }}
          />
          <Button
            icon={<Dismiss24Regular />}
            size="small"
            appearance="subtle"
            aria-label="删除条件"
            onClick={() => remove(q.id)}
          />
        </div>
      ))}
      <Button
        className={styles.add}
        icon={<Add24Regular />}
        size="small"
        appearance="outline"
        onClick={add}
      >
        添加条件
      </Button>
      <Text size={200} className={styles.matchInfo}>
        {matchText}
      </Text>
    </div>
  );
};

const rowLabel = (i: number, anchor: string) =>
  `第${i + 1}行${anchor ? `(${anchor})` : ""}`;
const colLabel = (i: number, anchor: string) =>
  `${colToLetter(i + 1)}列${anchor ? `(${anchor})` : ""}`;

export const RowSearch: React.FC<
  Omit<SearchPanelProps, "title" | "matchLabel">
> = (props) => <SearchPanel title="行搜索" matchLabel={rowLabel} {...props} />;

export const ColumnSearch: React.FC<
  Omit<SearchPanelProps, "title" | "matchLabel">
> = (props) => <SearchPanel title="列搜索" matchLabel={colLabel} {...props} />;
