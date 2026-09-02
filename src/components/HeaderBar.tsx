import * as React from "react";
import { Button, Text, makeStyles } from "@fluentui/react-components";
import { ArrowClockwise24Regular } from "@fluentui/react-icons";
import { useI18n } from "../i18n";

interface HeaderBarProps {
  loading: boolean;
  onRefresh: () => void;
}

const useStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: { display: "flex", alignItems: "center", gap: "8px" },
  title: {
    fontWeight: 600,
    fontSize: "16px",
    color: "#333333",
  },
});

/** 顶部栏：标题 + 语言切换 + 刷新按钮 */
const HeaderBar: React.FC<HeaderBarProps> = ({ loading, onRefresh }) => {
  const styles = useStyles();
  const { locale, setLocale, t } = useI18n();

  return (
    <div className={styles.root}>
      <div className={styles.left}>
        <Text className={styles.title}>{t("appTitle")}</Text>
        <Button
          size="small"
          appearance="outline"
          onClick={() => setLocale(locale === "zh" ? "en" : "zh")}
        >
          {t("langLabel")}
        </Button>
      </div>
      <Button
        icon={<ArrowClockwise24Regular />}
        size="small"
        appearance="outline"
        disabled={loading}
        onClick={onRefresh}
      >
        {t("refresh")}
      </Button>
    </div>
  );
};

export default HeaderBar;
