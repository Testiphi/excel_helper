import * as React from "react";
import { Button, Text, makeStyles } from "@fluentui/react-components";
import { ArrowClockwise24Regular } from "@fluentui/react-icons";

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
  title: {
    fontWeight: 600,
    fontSize: "16px",
    color: "#333333",
  },
});

/** 顶部栏：标题 + 刷新按钮 */
const HeaderBar: React.FC<HeaderBarProps> = ({ loading, onRefresh }) => {
  const styles = useStyles();
  return (
    <div className={styles.root}>
      <Text className={styles.title}>Excel 交叉定位</Text>
      <Button
        icon={<ArrowClockwise24Regular />}
        size="small"
        appearance="outline"
        disabled={loading}
        onClick={onRefresh}
      >
        刷新
      </Button>
    </div>
  );
};

export default HeaderBar;
