/** @jsx jsx */
import Skeleton, { SkeletonTheme, SkeletonProps, SkeletonThemeProps } from 'react-loading-skeleton';
import { jsx, useThemeUI } from 'theme-ui';

const SkeletonThemed = (props: SkeletonProps): React.ReactElement => {
  const { theme, colorMode } = useThemeUI();
  const isDark = theme.rawColors && colorMode === 'dark';

  const darkProps: SkeletonThemeProps = {
    color: isDark ? (theme?.rawColors?.surface as string) : undefined,
    highlightColor: isDark ? (theme?.rawColors?.background as string) : undefined
  };

  return (
    <SkeletonTheme {...{ ...darkProps }}>
      <Skeleton {...props} />
    </SkeletonTheme>
  );
};

export default SkeletonThemed;
