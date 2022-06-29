# stack-bitcoin-api

## Background
Bitcoin-native integration is imperative to unleash the Stacks' ecosystem potential. Stacks is the only smart contract platform that can react to events on the Bitcoin blockchain (see Catamaran Swaps https://www.catamaranswaps.org/). This project allow smart contract developers to verify transactions which occured on the Bitcoin blockchain. This can be used to implement cross-chain swaps between bitcoin and Stacks assets (SIP-010 Fungible tokens, SIP-009 Non-Fungible Tokens or STX itself), accept bitcoin payment for Stacks assets, and read data embedded in a bitcoin transaction. It attempts to do so in an optimally performant, enabling the building of truly unique applications that fully leverage Bitcoin’s unparalleled security features.

## How it works
Bitcoin transaction data is pulled from a post-seqwit Bitcoin node using the RPC endpoint. The node must be an archive node. Initally, it assumes that it is using a [Getblock](https://getblock.io/) node, since they offer a free tier node that meets the criteria.

A merkle proof for the transaction is created using the `merkletree` node module. In the future, it may be possible to eliminate this dependency by calling the `gettxoutproof` endpoint of Bitcoin RPC.

In order for the Stacks network to verify a proof, it needs to know the Stacks block height that corresponds to the block where the transaction of interest was recorded on the Bitcoin network. It uses the API that is available at `https://stacks-node-api.${NETWORK}.stacks.co` to retrieve this information. This API is slightly problematic because it doesn't offer an endpoint where the needed block height can be retrieved. Instead, data for a range of blocks need to be retrieved and searched for the Bitcoin block id. This node module implements a binary search of the API to avoid request throttling.

Once a proof is assembled, the entirety of the proof is sent to a Clarity smart contract endpoint. The smart contract is responsible for forwarding the proof to the `clarity-bitcoin.clar` contract for confirmation of its validity.

## Getting Started
1. `yarn add web3devs/stacks-bitcoin-api`
2. Create a `.env` file in the root of your project.
3. Create an account at [GetBlock](https://account.getblock.io/sign-up) and set up an API key. Add it to `.env`.
4. Add the parameters to pass a proof to you Clarity contract. Example code coming soon. For now, see the `was-tx-mined` and `was-tx-mined-compact` methods of [clarity-bitcoin](https://github.com/friedger/clarity-catamaranswaps/blob/bb552b99ac7abf78c3b4f53b3516e27024595dc9/contracts/clarity-bitcoin.clar).
5. Call your contract using the proof provided by the 

## Limitations
This currently only works for bitcoin transactions that have P2PKH and P2SH inputs and P2PKH, P2SH, and OP_RETURN outputs.

Transactions are limited to 8 inputs, 8 outputs, and a total tx bytelength of 1024. It will also fail when the block containing the transaction contains more than 4096 transactions.

The current implementation uses the existing contracts from [Catermaran Swap](https://github.com/friedger/clarity-catamaranswaps/blob/bb552b99ac7abf78c3b4f53b3516e27024595dc9/contracts/clarity-bitcoin.clar). When changes to contract are required to support additional features, the clarity-bitcoin contract will be ported to this project and modified appropriately. 

Coinbase transactions are not supported.

## Coming soon
This is an active work in progress. Future releases will include:
- A contract endpoint and supporting API code to pass a transaction as a decompacted tuple instead of as a compacted buffer. This will enable contracts that use this API to easily extract values from the contract without requiring an extra on chain invokation of a `parse-tx` function.  
- SeqWit transactions
- Taproot transactions
- Classic multisig transactions
- Analysis of performance to ensure that 200 verifications per block can be supported

## Stretch Goals
- Optional confirmation count requirements before a transaction proof is considered valid. 
- A working sample application, including contracts, that demonstrates how to use the API
- API code that can be used to present a request to a bitcoin wallet to send a transaction.
- Code that monitors the status of an unconfirmed transaction so that the UI can guide the user to the next steps after a transaction has been confirmed onchain.

## Requirements
The Clarity smart contract needs to receive the Transaction as a tuple (Object) that maps to the fields aforementioned for easy access.

The smart contract has to verify that the Transaction exists in the Bitcoin blockchain using proof of an inclusion to a Merkle Tree.

It must be possible for the Transaction to be converted into a raw transaction and then into its transaction ID. This is useful so that the transaction can be considered "confirmed”.

Expected performance is to be 200 verifications per block possible as per SIP-012 performance costs (https://github.com/hirosystems/sips/blob/draft/sip-012/sips/sip-012/sip-012-cost-limits-network-upgrade.md). This is the default in Clarinet code analysis.

## Acknowledgements
Thanks to Freiger from creating CatamaranSwaps where the feasiblity. Much of the code in the project was inspired by (or shamelessly copied) from his work. He was also critical to initiating the grant that paid for the work that is being done.

Thanks to the Stacks foundation for making this work possible. 
