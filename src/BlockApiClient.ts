import {BlocksApi, Configuration} from "@stacks/blockchain-api-client";

const { NETWORK } = process.env

const config = new Configuration({basePath: `https://stacks-node-api.${NETWORK}.stacks.co`})
const blocksApi = new BlocksApi(config)

export async function getStxBlockHeight(bitcoinBlockHeight: number): Promise<number | undefined> {
    let limit = 30;
    let offset = 0;
    const firstResponse = await blocksApi.getBlockList({ offset, limit });
    let stxBlock = firstResponse.results.find(b => b.burn_block_height === bitcoinBlockHeight);
    offset += Math.max(limit, firstResponse.results[0].burn_block_height - bitcoinBlockHeight);
    while (!stxBlock) {
        const blockListResponse = await blocksApi.getBlockList({ offset, limit });
        const blocks = blockListResponse.results;
        stxBlock = blocks.find(b => b.burn_block_height === bitcoinBlockHeight);
        offset -= limit;
        if (offset < 0 || blocks[blocks.length - 1].burn_block_height > bitcoinBlockHeight)
            return undefined;
    }
    return stxBlock.height;
}

