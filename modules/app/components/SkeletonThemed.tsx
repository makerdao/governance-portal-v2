import Skeleton, { SkeletonTheme, SkeletonProps, SkeletonThemeProps } from 'react-loading-skeleton';
import { useThemeUI } from 'theme-ui';

const SkeletonThemed = (props: SkeletonProps): React.ReactElement => {
  const { theme } = useThemeUI();

  const colorProps: SkeletonThemeProps = {
    color: theme?.colors?.skeletonColor as string,
    highlightColor: theme?.colors?.skeletonHighlightColor as string
  };

  return (
    <SkeletonTheme {...{ ...colorProps }}>
      <Skeleton {...props} />
    </SkeletonTheme>
  );
};

export default SkeletonThemed;
