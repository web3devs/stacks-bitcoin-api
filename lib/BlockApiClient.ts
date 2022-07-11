import {BlocksApi, Configuration} from "@stacks/blockchain-api-client"
import _ from "lodash"
import {compareToRange, Range, RangeComparison} from "./Utils.js"

const { NETWORK } = process.env

const config = new Configuration({basePath: `https://stacks-node-api.${NETWORK}.stacks.co`})
const blocksApi = new BlocksApi(config)

// TODO This function occasionally misses the block, the binary search algo needs more analysis
async function __getStxBlockHeight(bitcoinBlockHeight: number): Promise<number | undefined> {
    let limit = 30;
    let minOffset = 0, maxOffset = 0, offset = 0;

    // First check recent blocks
    const firstResponse = await blocksApi.getBlockList({ offset, limit });
    let stxBlock = firstResponse.results.find(b => b.burn_block_height === bitcoinBlockHeight);

    // Next check the furthest possible block
    offset += Math.max(limit, firstResponse.results[0].burn_block_height - bitcoinBlockHeight)
    minOffset = limit
    maxOffset = offset + limit
    while (!stxBlock) {
        // console.log('offsets:', minOffset, offset, maxOffset)
        const blockListResponse = await blocksApi.getBlockList({ offset, limit });
        const blocks = blockListResponse.results;

        // The block list has the most recent block first, so it has the maximum block height
        const range: Range = {
            min: blocks[blocks.length-1].burn_block_height,
            max:  blocks[0].burn_block_height
        }
        // console.log('heights:', range.min, bitcoinBlockHeight, range.max)
        switch (compareToRange(bitcoinBlockHeight, range)) {
            case RangeComparison.Contained:
                // console.log('contained')
                stxBlock = blocks.find(b => b.burn_block_height === bitcoinBlockHeight)
                return stxBlock?.height
            case RangeComparison.Above:
                // console.log('above')
                maxOffset = Math.max(offset - limit, minOffset)
                break
            case RangeComparison.Below:
                // console.log('below')
                minOffset = Math.min(offset + limit, maxOffset)
                break
        }
        if (offset < 0 || maxOffset < minOffset) {
            return undefined
        }
        // Binary search to avoid api throttling
        offset = Math.floor((minOffset + maxOffset) / 2)
    }
    if (!stxBlock) { throw "foo" }
    return stxBlock?.height;
}

export const getStxBlockHeight = _.memoize(__getStxBlockHeight)
