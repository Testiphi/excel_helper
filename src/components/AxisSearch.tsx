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
import { useI18n } from "../i18n";

interface SearchPanelProps {
  dimension: "row" | "col";
  queries: SearchQuery[];
  result: AxisSearchResult;
  onChange: (queries: SearchQuery[]) => void;
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
  dimension,
  queries,
  result,
  onChange,
}) => {
  const styles = useStyles();
  const { t } = useI18n();
  const isRow = dimension === "row";
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

  const matchLabel = (i: number, anchor: string) =>
    isRow
      ? t("rowLabel", {
          row: i + 1,
          anchor: anchor ? `(${anchor})` : "",
        })
      : t("colLabel", {
          letter: colToLetter(i + 1),
          anchor: anchor ? `(${anchor})` : "",
        });

  const matchText =
    result.indexes.length > 0
      ? t("matches", {
          n: result.indexes.length,
          list: result.indexes
            .map((i) => matchLabel(i, result.anchors[i]))
            .join(t("listSep")),
        })
      : hasActive
        ? t("noMatches")
        : t("searchHint");

  return (
    <div className={styles.root}>
      <Text size={200} weight="semibold">
        {t(isRow ? "rowSearch" : "colSearch")}
      </Text>
      {queries.map((q, idx) => (
        <div key={q.id} className={styles.row}>
          {idx > 0 && (
            <Dropdown
              aria-label="logic"
              value={q.logic}
              selectedOptions={[q.logic]}
              onOptionSelect={(_, d) =>
                update(q.id, { logic: d.optionValue as "AND" | "OR" })
              }
              style={{ minWidth: "56px" }}
            >
              <Option value="AND">{t("logicAnd")}</Option>
              <Option value="OR">{t("logicOr")}</Option>
            </Dropdown>
          )}
          <Dropdown
            aria-label="mode"
            value={q.mode}
            selectedOptions={[q.mode]}
            onOptionSelect={(_, d) =>
              update(q.id, { mode: d.optionValue as "contains" | "exact" })
            }
            style={{ minWidth: "72px" }}
          >
            <Option value="contains">{t("modeContains")}</Option>
            <Option value="exact">{t("modeEquals")}</Option>
          </Dropdown>
          <Input
            aria-label="search"
            placeholder={t("searchPlaceholder")}
            value={q.value}
            onChange={(_, d) => update(q.id, { value: d.value })}
            style={{ flex: 1 }}
          />
          <Button
            icon={<Dismiss24Regular />}
            size="small"
            appearance="subtle"
            aria-label={t("removeCondition")}
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
        {t("addCondition")}
      </Button>
      <Text size={200} className={styles.matchInfo}>
        {matchText}
      </Text>
    </div>
  );
};

export const RowSearch: React.FC<
  Omit<SearchPanelProps, "dimension">
> = (props) => <SearchPanel dimension="row" {...props} />;

export const ColumnSearch: React.FC<
  Omit<SearchPanelProps, "dimension">
> = (props) => <SearchPanel dimension="col" {...props} />;
