import 'dotenv/config';
import { hexOrBufferToHex } from "./Utils.js";
const { RPCURL, APIKEY } = process.env;
const callRpc = async (method, params) => {
    // TODO Make this work with the bitcoin node in the clarinet integrate environment
    const init = {
        method: 'POST',
        body: JSON.stringify({
            "jsonrpc": "2.0",
            "id": Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
            "method": method,
            "params": params
        }),
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': APIKEY,
        }
    };
    const response = await fetch(RPCURL, init);
    console.assert(response.status !== 401, response.status);
    const responseJson = await response.json();
    console.assert(!responseJson.error, JSON.stringify(responseJson.error));
    return responseJson.result;
};
export const getTransactionDetails = (txid) => callRpc('getrawtransaction', [hexOrBufferToHex(txid), true]);
export const getRawBlockHeader = (blockhash) => callRpc('getblockheader', [hexOrBufferToHex(blockhash), false]);
export const getBlockStats = (blockhash) => callRpc('getblock', [hexOrBufferToHex(blockhash), 1]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQml0Y29pblJwY0NsaWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL2xpYi9CaXRjb2luUnBjQ2xpZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sZUFBZSxDQUFBO0FBRXRCLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLFlBQVksQ0FBQTtBQUUzQyxNQUFNLEVBQUMsTUFBTSxFQUFFLE1BQU0sRUFBQyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUE7QUFFcEMsTUFBTSxPQUFPLEdBQUcsS0FBSyxFQUFFLE1BQWMsRUFBRSxNQUFhLEVBQWdCLEVBQUU7SUFDbEUsa0ZBQWtGO0lBQ2xGLE1BQU0sSUFBSSxHQUFHO1FBQ1QsTUFBTSxFQUFFLE1BQU07UUFDZCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztZQUNqQixTQUFTLEVBQUUsS0FBSztZQUNoQixJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDO1lBQ3pELFFBQVEsRUFBRSxNQUFNO1lBQ2hCLFFBQVEsRUFBRSxNQUFNO1NBQ25CLENBQUM7UUFDRixPQUFPLEVBQUU7WUFDTCxjQUFjLEVBQUUsa0JBQWtCO1lBQ2xDLFdBQVcsRUFBRSxNQUFnQjtTQUNoQztLQUNKLENBQUM7SUFDRixNQUFNLFFBQVEsR0FBRyxNQUFNLEtBQUssQ0FBQyxNQUFnQixFQUFFLElBQUksQ0FBQyxDQUFBO0lBQ3BELE9BQU8sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxHQUFHLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ3hELE1BQU0sWUFBWSxHQUFRLE1BQU0sUUFBUSxDQUFDLElBQUksRUFBRSxDQUFBO0lBQy9DLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUE7SUFDdkUsT0FBTyxZQUFZLENBQUMsTUFBTSxDQUFBO0FBQzlCLENBQUMsQ0FBQTtBQUVELE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLENBQUMsSUFBcUIsRUFBRSxFQUFFLENBQzNELE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUE7QUFFaEUsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxTQUEwQixFQUFFLEVBQUUsQ0FDNUQsT0FBTyxDQUFDLGdCQUFnQixFQUFFLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQTtBQUVuRSxNQUFNLENBQUMsTUFBTSxhQUFhLEdBQUcsQ0FBQyxTQUEwQixFQUFFLEVBQUUsQ0FDeEQsT0FBTyxDQUFDLFVBQVUsRUFBRSxDQUFDLGdCQUFnQixDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgJ2RvdGVudi9jb25maWcnXG5pbXBvcnQge0J1ZmZlcn0gZnJvbSBcImJ1ZmZlclwiXG5pbXBvcnQge2hleE9yQnVmZmVyVG9IZXh9IGZyb20gXCIuL1V0aWxzLmpzXCJcblxuY29uc3Qge1JQQ1VSTCwgQVBJS0VZfSA9IHByb2Nlc3MuZW52XG5cbmNvbnN0IGNhbGxScGMgPSBhc3luYyAobWV0aG9kOiBzdHJpbmcsIHBhcmFtczogYW55W10pOiBQcm9taXNlPGFueT4gPT4ge1xuICAgIC8vIFRPRE8gTWFrZSB0aGlzIHdvcmsgd2l0aCB0aGUgYml0Y29pbiBub2RlIGluIHRoZSBjbGFyaW5ldCBpbnRlZ3JhdGUgZW52aXJvbm1lbnRcbiAgICBjb25zdCBpbml0ID0ge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgXCJqc29ucnBjXCI6IFwiMi4wXCIsXG4gICAgICAgICAgICBcImlkXCI6IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIE51bWJlci5NQVhfU0FGRV9JTlRFR0VSKSxcbiAgICAgICAgICAgIFwibWV0aG9kXCI6IG1ldGhvZCxcbiAgICAgICAgICAgIFwicGFyYW1zXCI6IHBhcmFtc1xuICAgICAgICB9KSxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgICAgICd4LWFwaS1rZXknOiBBUElLRVkgYXMgc3RyaW5nLFxuICAgICAgICB9XG4gICAgfTtcbiAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFJQQ1VSTCBhcyBzdHJpbmcsIGluaXQpXG4gICAgY29uc29sZS5hc3NlcnQocmVzcG9uc2Uuc3RhdHVzICE9PSA0MDEsIHJlc3BvbnNlLnN0YXR1cylcbiAgICBjb25zdCByZXNwb25zZUpzb246IGFueSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgIGNvbnNvbGUuYXNzZXJ0KCFyZXNwb25zZUpzb24uZXJyb3IsIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlSnNvbi5lcnJvcikpXG4gICAgcmV0dXJuIHJlc3BvbnNlSnNvbi5yZXN1bHRcbn1cblxuZXhwb3J0IGNvbnN0IGdldFRyYW5zYWN0aW9uRGV0YWlscyA9ICh0eGlkOiBzdHJpbmcgfCBCdWZmZXIpID0+XG4gICAgY2FsbFJwYygnZ2V0cmF3dHJhbnNhY3Rpb24nLCBbaGV4T3JCdWZmZXJUb0hleCh0eGlkKSwgdHJ1ZV0pXG5cbmV4cG9ydCBjb25zdCBnZXRSYXdCbG9ja0hlYWRlciA9IChibG9ja2hhc2g6IHN0cmluZyB8IEJ1ZmZlcikgPT5cbiAgICBjYWxsUnBjKCdnZXRibG9ja2hlYWRlcicsIFtoZXhPckJ1ZmZlclRvSGV4KGJsb2NraGFzaCksIGZhbHNlXSlcblxuZXhwb3J0IGNvbnN0IGdldEJsb2NrU3RhdHMgPSAoYmxvY2toYXNoOiBzdHJpbmcgfCBCdWZmZXIpID0+XG4gICAgY2FsbFJwYygnZ2V0YmxvY2snLCBbaGV4T3JCdWZmZXJUb0hleChibG9ja2hhc2gpLCAxXSkiXX0=