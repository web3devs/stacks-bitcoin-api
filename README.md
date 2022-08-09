# stacks-bitcoin-api
stacks-bitcoin-api is a node maodule that verifies BTC transactions on Stacks using the [clarity-bitcoin](https://github.com/friedger/clarity-catamaranswaps/blob/bb552b99ac7abf78c3b4f53b3516e27024595dc9/contracts/clarity-bitcoin.clar) contract from [Catarmaran Swaps](https://www.catamaranswaps.org/) project.

## Background
Bitcoin-native integration is imperative to unleash the Stacks' ecosystem potential. Stacks is the only smart contract platform that can react to events on the Bitcoin blockchain (see https://www.catamaranswaps.org/). This module implements the client side code to interact with the [clarity-bitcoin](https://github.com/friedger/clarity-catamaranswaps/blob/bb552b99ac7abf78c3b4f53b3516e27024595dc9/contracts/clarity-bitcoin.clar) smart contract. Potential use cases include:
- Implement cross-chain swaps between bitcoin and Stacks assets (SIP-010 Fungible tokens, SIP-009 Non-Fungible Tokens or STX itself
- Accept bitcoin payment for Stacks assets
- Read data embedded in a bitcoin transaction

## How it works
Bitcoin transaction data is pulled from a post-segwit Bitcoin node using the RPC endpoint. The node must be an archive node. Initially, it assumes that it is using a [GetBlock](https://getblock.io/) node, since they offer a free tier node that meets all of the requirements.

A merkle proof for the transaction is created using the `merkletree` node module. In the future, it may be possible to eliminate this dependency by calling the `gettxoutproof` endpoint of Bitcoin RPC.

In order for the Stacks network to verify a proof, it needs to know the Stacks block height that corresponds to the block where the transaction of interest was recorded on the Bitcoin network. It uses the API that is available at `https://stacks-node-api.${NETWORK}.stacks.co` to retrieve this information. This API is slightly problematic because it doesn't offer an endpoint where the only needed block height can be retrieved. Instead, data for a range of blocks are retrieved, then searched for the Bitcoin block id. This API implements a binary search of the API to avoid request throttling.

Once a proof is assembled, the entirety of the proof is sent to a Clarity smart contract endpoint. This can be the `clarity-bitcoin.clar` contract or a custom contract the delegates to `clartiy-bitcoin.clar`.

## Getting Started
1. `yarn add web3devs/stacks-bitcoin-api`
2. Create a `.env` file in the root of your project.
3. Create an account at [GetBlock](https://account.getblock.io/sign-up) and set up an API key. Add it to `.env`.
4. Add the parameters to pass a proof to your Clarity contract. See the `was-tx-mined` and `was-tx-mined-compact` methods of [clarity-bitcoin](https://github.com/friedger/clarity-catamaranswaps/blob/bb552b99ac7abf78c3b4f53b3516e27024595dc9/contracts/clarity-bitcoin.clar) for an example.
5. Call your contract using the provided proof. 

## Limitations
Transactions are limited to 8 inputs, 8 outputs, and a total tx bytelength of 1024. It will also fail when the block containing the transaction contains more than 4096 transactions. It will also fail if the 

Coinbase transactions can be verified, but the coinbase message is not accessible.

Due to a limitation in the [clarity-bitcoin](https://github.com/friedger/clarity-catamaranswaps/blob/bb552b99ac7abf78c3b4f53b3516e27024595dc9/contracts/clarity-bitcoin.clar) smart contract, transactions with a scriptpubkey longer than 127 bytes will fail. This could cause problems for classic multisig transactions outputs and non-standard transactions that use a long script.

## Acknowledgements
Thanks to Friedger for creating CatamaranSwaps where the feasiblity of verifying Bitcoin transactions in a Clarity contract was proven. Much of the code in the project was inspired by (or shamelessly copied) from his work. He was also critical to initiating the grant that paid for the work that is being done.

Thanks to the Stacks foundation for making this work possible. 

This project was run by James Ruffer through [Web3Devs](https://web3devs.com/). Thanks for your patience and support.