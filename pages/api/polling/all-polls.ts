/*

SPDX-FileCopyrightText: © 2023 Dai Foundation <www.daifoundation.org>

SPDX-License-Identifier: AGPL-3.0-or-later

*/

import { NextApiRequest, NextApiResponse } from 'next';
import { getPollsPaginated } from 'modules/polling/api/fetchPolls';
import withApiHandler from 'modules/app/api/withApiHandler';
import { DEFAULT_NETWORK, SupportedNetworks } from 'modules/web3/constants/networks';
import validateQueryParam from 'modules/app/api/validateQueryParam';
import { PollInputFormat, PollOrderByEnum, PollStatusEnum } from 'modules/polling/polling.constants';
import { PollsPaginatedResponse } from 'modules/polling/types/pollsResponse';

/**
 * @swagger
 * paths:
 *  /api/polling/all-polls:
 *    get:
 *      tags:
 *        - "polls"
 *      description: Returns a paginated list of polls according to the specified filters and sorting.
 *      summary: Returns a paginated list of polls
 *      produces:
 *        - "application/json"
 *      parameters:
 *        - name: network
 *          in: query
 *          description: The network to query the polls for. Defaults to mainnet.
 *          required: false
 *          schema:
 *            type: string
 *            enum: [mainnet, tenderly]
 *            default: mainnet
 *        - name: pageSize
 *          in: query
 *          description: The number of polls to return per page.
 *          required: false
 *          schema:
 *            type: integer
 *            minimum: 1
 *            maximum: 30
 *            default: 20
 *        - name: page
 *          in: query
 *          description: The page number to return.
 *          required: false
 *          schema:
 *            type: integer
 *            minimum: 1
 *            default: 1
 *        - name: title
 *          in: query
 *          description: The title or portion of the title to filters the polls for.
 *          required: false
 *          schema:
 *            type: string
 *        - name: orderBy
 *          in: query
 *          description: The sorting criteria used to order the polls returned.
 *          required: false
 *          schema:
 *            type: string
 *            enum: [NEAREST_END, FURTHEST_END, NEAREST_START, FURTHEST_START]
 *            default: NEAREST_END
 *        - name: tags # Array of tag IDs/shortnames
 *          in: query
 *          description: The tags to filter the polls by (e.g., core-unit-budget, ratification-poll).
 *          required: false
 *          schema:
 *            type: array
 *            items:
 *              type: string
 *        - name: status
 *          in: query
 *          description: The status the poll is in.
 *          required: false
 *          schema:
 *            type: string
 *            enum: [ACTIVE, ENDED]
 *        - name: type # Array of PollInputFormat values
 *          in: query
 *          description: The input format type(s) of the poll.
 *          required: false
 *          schema:
 *            type: array
 *            items:
 *              type: string
 *              enum: [singleChoice, rankFree, chooseFree, majority]
 *        - name: startDate
 *          in: query
 *          description: Minimum start date of the polls returned (ISO8601 format).
 *          required: false
 *          schema:
 *            type: string
 *            format: date-time
 *        - name: endDate
 *          in: query
 *          description: Maximum end date of the polls returned (ISO8601 format).
 *          required: false
 *          schema:
 *            type: string
 *            format: date-time
 *      responses:
 *        200:
 *          description: A paginated list of polls matching the specified filters and sorting.
 *          content:
 *            application/json:
 *              schema:
 *                $ref: '#/components/schemas/PollsPaginatedResponse'
 * components:
 *  schemas:
 *    Tag: # Simplified based on modules/app/types/tag.d.ts
 *      type: object
 *      properties:
 *        id:
 *          type: string
 *          description: Unique identifier for the tag (e.g., "core-unit-budget").
 *        shortname:
 *          type: string
 *          description: A short, display-friendly name for the tag.
 *        longname:
 *          type: string
 *          description: A longer, more descriptive name for the tag.
 *        description:
 *          type: string
 *          nullable: true # Description can be optional
 *          description: A brief description of what the tag represents.
 *    TagCount:
 *      allOf:
 *        - $ref: '#/components/schemas/Tag'
 *        - type: object
 *          properties:
 *            count:
 *              type: integer
 *          required:
 *            - count # Corrected from -count
 *    PollParametersInputFormat: # Based on [poll-id-or-slug].ts
 *      type: object
 *      properties:
 *        type:
 *          type: string
 *          description: The input format type (e.g., singleChoice, rankFree).
 *          enum: [singleChoice, rankFree, chooseFree, majority]
 *        abstain:
 *          type: array
 *          items:
 *            type: integer
 *          description: Array of option indices that represent an abstention.
 *        options:
 *          type: array
 *          items:
 *            type: integer
 *          description: Array of all available option indices (used in some formats).
 *    PollParametersVictoryCondition: # Based on [poll-id-or-slug].ts
 *      type: object # This can be one of several structures, simplified here
 *      properties:
 *        type:
 *          type: string
 *          description: Type of victory condition (e.g., plurality, majority, instantRunoff).
 *        percent:
 *          type: number
 *          format: float
 *          nullable: true
 *          description: Percentage required for majority (if type is majority).
 *    PollParameters: # Based on [poll-id-or-slug].ts
 *      type: object
 *      properties:
 *        inputFormat:
 *          $ref: '#/components/schemas/PollParametersInputFormat'
 *        victoryConditions:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/PollParametersVictoryCondition'
 *          description: Conditions that determine the outcome of the poll.
 *        resultDisplay:
 *          type: string
 *          description: How the poll results should be displayed.
 *    PollListItem:
 *      type: object
 *      properties:
 *        pollId:
 *          type: number
 *        multiHash:
 *          type: string
 *          description: IPFS multihash of the poll markdown content.
 *        slug:
 *          type: string
 *          description: URL-friendly slug, often derived from multiHash.
 *        title:
 *          type: string
 *        summary:
 *          type: string
 *          nullable: true
 *        discussionLink:
 *          type: string
 *          format: url
 *          nullable: true
 *        parameters:
 *          $ref: '#/components/schemas/PollParameters'
 *        options:
 *          type: object
 *          description: Key-value pairs of option index (string) to option text (string).
 *          additionalProperties:
 *            type: string
 *          example:
 *            "0": "Abstain"
 *            "1": "Yes"
 *        startDate:
 *          type: string
 *          format: date-time
 *        endDate:
 *          type: string
 *          format: date-time
 *        url:
 *          type: string
 *          format: url
 *          description: URL to the raw poll content (e.g., GitHub markdown file).
 *        type: # Corresponds to PollInputFormat, which is part of PollListItem
 *          type: string
 *          enum: [singleChoice, rankFree, chooseFree, majority]
 *          description: The input format type for the poll.
 *        tags: # Array of tag IDs/shortnames
 *          type: array
 *          items:
 *            type: string
 *    PollsStatsTypeBreakdown: # For PollsPaginatedResponse.stats.type
 *      type: object
 *      properties:
 *        singleChoice:
 *          type: integer
 *          nullable: true
 *        rankFree:
 *          type: integer
 *          nullable: true
 *        majority:
 *          type: integer
 *          nullable: true
 *        chooseFree:
 *          type: integer
 *          nullable: true
 *    PollsPaginatedResponse:
 *      type: object
 *      properties:
 *        paginationInfo:
 *          type: object
 *          properties:
 *            totalCount:
 *              type: number
 *            page:
 *              type: number
 *            numPages:
 *              type: number
 *            hasNextPage:
 *              type: boolean
 *        stats:
 *          type: object
 *          properties:
 *            active:
 *              type: number
 *            finished:
 *              type: number
 *            total:
 *              type: number
 *            type:
 *              $ref: '#/components/schemas/PollsStatsTypeBreakdown'
 *              nullable: true
 *        polls:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/PollListItem'
 *        tags:
 *          type: array
 *          items:
 *            $ref: '#/components/schemas/TagCount'
 */

export default withApiHandler(async (req: NextApiRequest, res: NextApiResponse<PollsPaginatedResponse>) => {
  const network = validateQueryParam(req.query.network, 'string', {
    defaultValue: DEFAULT_NETWORK.network,
    validValues: [SupportedNetworks.TENDERLY, SupportedNetworks.MAINNET]
  }) as SupportedNetworks;

  const pageSize = validateQueryParam(req.query.pageSize, 'number', {
    defaultValue: 20,
    minValue: 1,
    maxValue: 30
  }) as number;

  const page = validateQueryParam(req.query.page, 'number', {
    defaultValue: 1,
    minValue: 1
  }) as number;

  const title = validateQueryParam(req.query.title, 'string', {
    defaultValue: null
  }) as string | null;

  const orderBy = validateQueryParam(req.query.orderBy, 'string', {
    defaultValue: PollOrderByEnum.nearestEnd,
    validValues: [
      PollOrderByEnum.nearestEnd,
      PollOrderByEnum.furthestEnd,
      PollOrderByEnum.nearestStart,
      PollOrderByEnum.furthestStart
    ]
  }) as PollOrderByEnum;

  const tags = validateQueryParam(req.query.tags, 'array', {
    defaultValue: null
  }) as string[] | null;

  const status = validateQueryParam(req.query.status, 'string', {
    defaultValue: null,
    validValues: [PollStatusEnum.active, PollStatusEnum.ended]
  }) as PollStatusEnum | null;

  const type =
    ((
      validateQueryParam(req.query.type, 'array', {
        defaultValue: null
      }) as string[] | null
    )
      ?.map(t =>
        validateQueryParam(t, 'string', {
          defaultValue: null,
          validValues: [PollInputFormat.singleChoice, PollInputFormat.rankFree, PollInputFormat.chooseFree]
        })
      )
      .filter(t => !!t) as PollInputFormat[] | undefined) || null;

  const startDate = validateQueryParam(req.query.startDate, 'date', {
    defaultValue: null
  }) as Date | null;

  const endDate = validateQueryParam(req.query.endDate, 'date', {
    defaultValue: null
  }) as Date | null;

  const pollsResponse = await getPollsPaginated({
    network,
    pageSize,
    page,
    title,
    orderBy,
    tags,
    status,
    type,
    startDate,
    endDate
  });

  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.status(200).json(pollsResponse);
});
