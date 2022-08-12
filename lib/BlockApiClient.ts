import { BlocksApi, Configuration } from '@stacks/blockchain-api-client'
import _ from 'lodash'
import { compareToRange, Range, RangeComparison } from './Utils.js'

const { NETWORK } = process.env

const config = new Configuration({
    basePath: `https://stacks-node-api.${NETWORK}.stacks.co`,
})
const blocksApi = new BlocksApi(config)

async function __getStxBlockHeight(bitcoinBlockHeight: number): Promise<number | undefined> {
    let limit = 30
    let minOffset,
        maxOffset,
        offset = 0

    // First check recent blocks
    const firstResponse = await blocksApi.getBlockList({ offset, limit })
    const currentBlockHeight = firstResponse.results[0].height

    let stxBlock = firstResponse.results.find((b) => b.burn_block_height === bitcoinBlockHeight)

    // Next check the furthest possible block
    offset = Math.min(currentBlockHeight, firstResponse.results[0].burn_block_height - bitcoinBlockHeight) - limit
    minOffset = limit
    maxOffset = offset + limit
    while (!stxBlock) {
        const blockListResponse = await blocksApi.getBlockList({
            offset,
            limit,
        })
        const blocks = blockListResponse.results

        // The block list has the most recent block first, so it has the maximum block height
        const range: Range = {
            min: blocks[blocks.length - 1].burn_block_height,
            max: blocks[0].burn_block_height,
        }
        switch (compareToRange(bitcoinBlockHeight, range)) {
            case RangeComparison.Contained:
                stxBlock = blocks.find((b) => b.burn_block_height === bitcoinBlockHeight)
                return stxBlock?.height
            case RangeComparison.Above:
                maxOffset = Math.max(offset - limit, minOffset)
                break
            case RangeComparison.Below:
                minOffset = Math.min(offset + limit, maxOffset)
                break
        }
        if (offset < 0 || maxOffset < minOffset) {
            return undefined
        }
        // Binary search to avoid api throttling
        offset = Math.floor((minOffset + maxOffset) / 2)
    }
    if (!stxBlock) {
        throw `Unable to find the stacks block that corresponds to bitcoin block ${bitcoinBlockHeight}`
    }
    return stxBlock?.height
}

export const getStxBlockHeight = _.memoize(__getStxBlockHeight)
