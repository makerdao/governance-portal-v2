/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import Skeleton, { SkeletonTheme, SkeletonProps, SkeletonThemeProps } from 'react-loading-skeleton';

const SkeletonThemed = (props: SkeletonProps): React.ReactElement => {
  const colorProps: SkeletonThemeProps = {
    color: 'rgba(255, 255, 255, 0.35)',
    highlightColor: 'rgba(255, 255, 255, 0.45)' // 0.35 alpha = semi-transparent
  };

  return (
    <SkeletonTheme {...{ ...colorProps }}>
      <Skeleton {...props} />
    </SkeletonTheme>
  );
};

export default SkeletonThemed;
