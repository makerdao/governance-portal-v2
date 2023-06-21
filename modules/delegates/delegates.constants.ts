/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

export enum DelegateStatusEnum {
  aligned = 'aligned',
  expired = 'expired',
  shadow = 'shadow'
}

export enum MKRWeightTimeRanges {
  day = 'day',
  week = 'week',
  month = 'month'
}

export enum DelegateTypeEnum {
  ALIGNED = 'ALIGNED',
  SHADOW = 'SHADOW',
  ALL = 'ALL'
}

export enum DelegateOrderByEnum {
  DATE = 'DATE',
  MKR = 'MKR',
  DELEGATORS = 'DELEGATORS',
  RANDOM = 'RANDOM'
}

export enum OrderDirectionEnum {
  ASC = 'ASC',
  DESC = 'DESC'
}
