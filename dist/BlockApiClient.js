import { BlocksApi, Configuration } from "@stacks/blockchain-api-client";
import { compareToRange, RangeComparison } from "./Utils.js";
const { NETWORK } = process.env;
const config = new Configuration({ basePath: `https://stacks-node-api.${NETWORK}.stacks.co` });
const blocksApi = new BlocksApi(config);
// TODO This function occasionally misses the block, the binary search algo needs more analysis
export async function getStxBlockHeight(bitcoinBlockHeight) {
    let limit = 30;
    let minOffset = 0, maxOffset = 0, offset = 0;
    // First check recent blocks
    const firstResponse = await blocksApi.getBlockList({ offset, limit });
    let stxBlock = firstResponse.results.find(b => b.burn_block_height === bitcoinBlockHeight);
    // Next check the furthest possible block
    offset += Math.max(limit, firstResponse.results[0].burn_block_height - bitcoinBlockHeight);
    minOffset = limit;
    maxOffset = offset + limit;
    while (!stxBlock) {
        // console.log('offsets:', minOffset, offset, maxOffset)
        const blockListResponse = await blocksApi.getBlockList({ offset, limit });
        const blocks = blockListResponse.results;
        // The block list has the most recent block first, so it has the maximum block height
        const range = {
            min: blocks[blocks.length - 1].burn_block_height,
            max: blocks[0].burn_block_height
        };
        // console.log('heights:', range.min, bitcoinBlockHeight, range.max)
        switch (compareToRange(bitcoinBlockHeight, range)) {
            case RangeComparison.Contained:
                // console.log('contained')
                stxBlock = blocks.find(b => b.burn_block_height === bitcoinBlockHeight);
                return stxBlock?.height;
            case RangeComparison.Above:
                // console.log('above')
                maxOffset = Math.max(offset - limit, minOffset);
                break;
            case RangeComparison.Below:
                // console.log('below')
                minOffset = Math.min(offset + limit, maxOffset);
                break;
        }
        if (offset < 0 || maxOffset < minOffset) {
            return undefined;
        }
        // Binary search to avoid api throttling
        offset = Math.floor((minOffset + maxOffset) / 2);
    }
    if (!stxBlock) {
        throw "foo";
    }
    return stxBlock?.height;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQmxvY2tBcGlDbGllbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9saWIvQmxvY2tBcGlDbGllbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUMsTUFBTSwrQkFBK0IsQ0FBQTtBQUN0RSxPQUFPLEVBQUMsY0FBYyxFQUFTLGVBQWUsRUFBQyxNQUFNLFlBQVksQ0FBQTtBQUVqRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQTtBQUUvQixNQUFNLE1BQU0sR0FBRyxJQUFJLGFBQWEsQ0FBQyxFQUFDLFFBQVEsRUFBRSwyQkFBMkIsT0FBTyxZQUFZLEVBQUMsQ0FBQyxDQUFBO0FBQzVGLE1BQU0sU0FBUyxHQUFHLElBQUksU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBRXZDLCtGQUErRjtBQUMvRixNQUFNLENBQUMsS0FBSyxVQUFVLGlCQUFpQixDQUFDLGtCQUEwQjtJQUM5RCxJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7SUFDZixJQUFJLFNBQVMsR0FBRyxDQUFDLEVBQUUsU0FBUyxHQUFHLENBQUMsRUFBRSxNQUFNLEdBQUcsQ0FBQyxDQUFDO0lBRTdDLDRCQUE0QjtJQUM1QixNQUFNLGFBQWEsR0FBRyxNQUFNLFNBQVMsQ0FBQyxZQUFZLENBQUMsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztJQUN0RSxJQUFJLFFBQVEsR0FBRyxhQUFhLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsS0FBSyxrQkFBa0IsQ0FBQyxDQUFDO0lBRTNGLHlDQUF5QztJQUN6QyxNQUFNLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxpQkFBaUIsR0FBRyxrQkFBa0IsQ0FBQyxDQUFBO0lBQzFGLFNBQVMsR0FBRyxLQUFLLENBQUE7SUFDakIsU0FBUyxHQUFHLE1BQU0sR0FBRyxLQUFLLENBQUE7SUFDMUIsT0FBTyxDQUFDLFFBQVEsRUFBRTtRQUNkLHdEQUF3RDtRQUN4RCxNQUFNLGlCQUFpQixHQUFHLE1BQU0sU0FBUyxDQUFDLFlBQVksQ0FBQyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1FBQzFFLE1BQU0sTUFBTSxHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQztRQUV6QyxxRkFBcUY7UUFDckYsTUFBTSxLQUFLLEdBQVU7WUFDakIsR0FBRyxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQjtZQUM5QyxHQUFHLEVBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLGlCQUFpQjtTQUNwQyxDQUFBO1FBQ0Qsb0VBQW9FO1FBQ3BFLFFBQVEsY0FBYyxDQUFDLGtCQUFrQixFQUFFLEtBQUssQ0FBQyxFQUFFO1lBQy9DLEtBQUssZUFBZSxDQUFDLFNBQVM7Z0JBQzFCLDJCQUEyQjtnQkFDM0IsUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsaUJBQWlCLEtBQUssa0JBQWtCLENBQUMsQ0FBQTtnQkFDdkUsT0FBTyxRQUFRLEVBQUUsTUFBTSxDQUFBO1lBQzNCLEtBQUssZUFBZSxDQUFDLEtBQUs7Z0JBQ3RCLHVCQUF1QjtnQkFDdkIsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQTtnQkFDL0MsTUFBSztZQUNULEtBQUssZUFBZSxDQUFDLEtBQUs7Z0JBQ3RCLHVCQUF1QjtnQkFDdkIsU0FBUyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEtBQUssRUFBRSxTQUFTLENBQUMsQ0FBQTtnQkFDL0MsTUFBSztTQUNaO1FBQ0QsSUFBSSxNQUFNLEdBQUcsQ0FBQyxJQUFJLFNBQVMsR0FBRyxTQUFTLEVBQUU7WUFDckMsT0FBTyxTQUFTLENBQUE7U0FDbkI7UUFDRCx3Q0FBd0M7UUFDeEMsTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7S0FDbkQ7SUFDRCxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQUUsTUFBTSxLQUFLLENBQUE7S0FBRTtJQUM5QixPQUFPLFFBQVEsRUFBRSxNQUFNLENBQUM7QUFDNUIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7QmxvY2tzQXBpLCBDb25maWd1cmF0aW9ufSBmcm9tIFwiQHN0YWNrcy9ibG9ja2NoYWluLWFwaS1jbGllbnRcIlxuaW1wb3J0IHtjb21wYXJlVG9SYW5nZSwgUmFuZ2UsIFJhbmdlQ29tcGFyaXNvbn0gZnJvbSBcIi4vVXRpbHMuanNcIlxuXG5jb25zdCB7IE5FVFdPUksgfSA9IHByb2Nlc3MuZW52XG5cbmNvbnN0IGNvbmZpZyA9IG5ldyBDb25maWd1cmF0aW9uKHtiYXNlUGF0aDogYGh0dHBzOi8vc3RhY2tzLW5vZGUtYXBpLiR7TkVUV09SS30uc3RhY2tzLmNvYH0pXG5jb25zdCBibG9ja3NBcGkgPSBuZXcgQmxvY2tzQXBpKGNvbmZpZylcblxuLy8gVE9ETyBUaGlzIGZ1bmN0aW9uIG9jY2FzaW9uYWxseSBtaXNzZXMgdGhlIGJsb2NrLCB0aGUgYmluYXJ5IHNlYXJjaCBhbGdvIG5lZWRzIG1vcmUgYW5hbHlzaXNcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRTdHhCbG9ja0hlaWdodChiaXRjb2luQmxvY2tIZWlnaHQ6IG51bWJlcik6IFByb21pc2U8bnVtYmVyIHwgdW5kZWZpbmVkPiB7XG4gICAgbGV0IGxpbWl0ID0gMzA7XG4gICAgbGV0IG1pbk9mZnNldCA9IDAsIG1heE9mZnNldCA9IDAsIG9mZnNldCA9IDA7XG5cbiAgICAvLyBGaXJzdCBjaGVjayByZWNlbnQgYmxvY2tzXG4gICAgY29uc3QgZmlyc3RSZXNwb25zZSA9IGF3YWl0IGJsb2Nrc0FwaS5nZXRCbG9ja0xpc3QoeyBvZmZzZXQsIGxpbWl0IH0pO1xuICAgIGxldCBzdHhCbG9jayA9IGZpcnN0UmVzcG9uc2UucmVzdWx0cy5maW5kKGIgPT4gYi5idXJuX2Jsb2NrX2hlaWdodCA9PT0gYml0Y29pbkJsb2NrSGVpZ2h0KTtcblxuICAgIC8vIE5leHQgY2hlY2sgdGhlIGZ1cnRoZXN0IHBvc3NpYmxlIGJsb2NrXG4gICAgb2Zmc2V0ICs9IE1hdGgubWF4KGxpbWl0LCBmaXJzdFJlc3BvbnNlLnJlc3VsdHNbMF0uYnVybl9ibG9ja19oZWlnaHQgLSBiaXRjb2luQmxvY2tIZWlnaHQpXG4gICAgbWluT2Zmc2V0ID0gbGltaXRcbiAgICBtYXhPZmZzZXQgPSBvZmZzZXQgKyBsaW1pdFxuICAgIHdoaWxlICghc3R4QmxvY2spIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ29mZnNldHM6JywgbWluT2Zmc2V0LCBvZmZzZXQsIG1heE9mZnNldClcbiAgICAgICAgY29uc3QgYmxvY2tMaXN0UmVzcG9uc2UgPSBhd2FpdCBibG9ja3NBcGkuZ2V0QmxvY2tMaXN0KHsgb2Zmc2V0LCBsaW1pdCB9KTtcbiAgICAgICAgY29uc3QgYmxvY2tzID0gYmxvY2tMaXN0UmVzcG9uc2UucmVzdWx0cztcblxuICAgICAgICAvLyBUaGUgYmxvY2sgbGlzdCBoYXMgdGhlIG1vc3QgcmVjZW50IGJsb2NrIGZpcnN0LCBzbyBpdCBoYXMgdGhlIG1heGltdW0gYmxvY2sgaGVpZ2h0XG4gICAgICAgIGNvbnN0IHJhbmdlOiBSYW5nZSA9IHtcbiAgICAgICAgICAgIG1pbjogYmxvY2tzW2Jsb2Nrcy5sZW5ndGgtMV0uYnVybl9ibG9ja19oZWlnaHQsXG4gICAgICAgICAgICBtYXg6ICBibG9ja3NbMF0uYnVybl9ibG9ja19oZWlnaHRcbiAgICAgICAgfVxuICAgICAgICAvLyBjb25zb2xlLmxvZygnaGVpZ2h0czonLCByYW5nZS5taW4sIGJpdGNvaW5CbG9ja0hlaWdodCwgcmFuZ2UubWF4KVxuICAgICAgICBzd2l0Y2ggKGNvbXBhcmVUb1JhbmdlKGJpdGNvaW5CbG9ja0hlaWdodCwgcmFuZ2UpKSB7XG4gICAgICAgICAgICBjYXNlIFJhbmdlQ29tcGFyaXNvbi5Db250YWluZWQ6XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2NvbnRhaW5lZCcpXG4gICAgICAgICAgICAgICAgc3R4QmxvY2sgPSBibG9ja3MuZmluZChiID0+IGIuYnVybl9ibG9ja19oZWlnaHQgPT09IGJpdGNvaW5CbG9ja0hlaWdodClcbiAgICAgICAgICAgICAgICByZXR1cm4gc3R4QmxvY2s/LmhlaWdodFxuICAgICAgICAgICAgY2FzZSBSYW5nZUNvbXBhcmlzb24uQWJvdmU6XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2Fib3ZlJylcbiAgICAgICAgICAgICAgICBtYXhPZmZzZXQgPSBNYXRoLm1heChvZmZzZXQgLSBsaW1pdCwgbWluT2Zmc2V0KVxuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICBjYXNlIFJhbmdlQ29tcGFyaXNvbi5CZWxvdzpcbiAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnYmVsb3cnKVxuICAgICAgICAgICAgICAgIG1pbk9mZnNldCA9IE1hdGgubWluKG9mZnNldCArIGxpbWl0LCBtYXhPZmZzZXQpXG4gICAgICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgICBpZiAob2Zmc2V0IDwgMCB8fCBtYXhPZmZzZXQgPCBtaW5PZmZzZXQpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWRcbiAgICAgICAgfVxuICAgICAgICAvLyBCaW5hcnkgc2VhcmNoIHRvIGF2b2lkIGFwaSB0aHJvdHRsaW5nXG4gICAgICAgIG9mZnNldCA9IE1hdGguZmxvb3IoKG1pbk9mZnNldCArIG1heE9mZnNldCkgLyAyKVxuICAgIH1cbiAgICBpZiAoIXN0eEJsb2NrKSB7IHRocm93IFwiZm9vXCIgfVxuICAgIHJldHVybiBzdHhCbG9jaz8uaGVpZ2h0O1xufVxuXG4iXX0=