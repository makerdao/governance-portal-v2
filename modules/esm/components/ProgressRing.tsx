/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { Flex } from 'theme-ui';
import { formatValue } from 'lib/string';

const ProgressRing = ({
  progress,
  totalStaked,
  thresholdAmount
}: {
  progress: number;
  totalStaked?: bigint;
  thresholdAmount?: bigint;
}): React.ReactElement => {
  const radius = 116;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  return (
    <Flex sx={{ justifyContent: 'center', alignItems: 'center' }} data-testid="progress-ring">
      <svg height={radius * 2} width={radius * 2}>
        <circle
          stroke="#F6F8F9"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset: 0 }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke="#F75524"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        ></circle>
        <text x="50%" y="48%" textAnchor="middle" fill="#434358" fontSize="18px" dy=".3em">
          {totalStaked ? `${formatValue(totalStaked, 'wad', 6)}` : '---'}
        </text>
        <text x="50%" y="58%" textAnchor="middle" fill="#708390" fontSize="14px" dy=".3em">
          {`of ${thresholdAmount ? `${formatValue(thresholdAmount)} MKR` : '---'}`}
        </text>
      </svg>
    </Flex>
  );
};

export default ProgressRing;
