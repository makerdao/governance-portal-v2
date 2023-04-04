/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

export enum DelegateStatusEnum {
  constitutional = 'constitutional',
  expired = 'expired',
  shadow = 'shadow'
}

export enum MKRWeightTimeRanges {
  day = 'day',
  week = 'week',
  month = 'month'
}

export enum DelegateTypeEnum {
  CONSTITUTIONAL = 'CONSTITUTIONAL',
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
