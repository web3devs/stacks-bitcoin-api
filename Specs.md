# stack-bitcoin-api

## Background

Bitcoin-native integration is imperative to unleash the Stacks' ecosystem potential. Stacks is the only smart contract platform that can react to events on the Bitcoin blockchain (see Catamaran Swaps https://www.catamaranswaps.org/). Catamaran Swaps allow users to swap on-chain bitcoin for Stacks assets (SIP-010 Fungible tokens, SIP-009 Non-Fungible Tokens or STX itself). To build truly unique applications that fully leverage Bitcoin’s unparalleled security features, we need optimally performant ready-to-use Catamaran Swaps.

Currently, Catamaran Swaps don’t support most regular Bitcoin transaction types. This means that an app that uses Catamaran Swaps today will only be able to serve users with specific types of Bitcoin transactions leading to a bad user experience. The grant proposal aims to solve this problem by building smart contracts that can verify that a transaction was included in a Bitcoin block. These smart contracts can be used to verify most popular transaction output types so that their output data can be used for further processing.

The completion of this grant will make Catamaran Swaps ready for adoption by apps built on Stacks in time for the Stacks 2.1 upgrade (https://stacks.org/stacks-upgrade-2-1). Currently, the Stacks network is unable to see some Bitcoin blocks (called Flashblocks), but the 2.1 update will have a fix for it.

An upgrade to Catamaran Swaps is probably the most high leverage piece of work in the Stacks ecosystem right now, as it will allow truly new applications such as NFT marketplaces where buyers pay in native Bitcoin, DeFi apps where native Bitcoin is swapped for fungible assets on Stacks, etc. These would be the killer applications that allow Stacks to win the mindshare it deserves in the Bitcoin community.

## Project Overview

The bitcoin.clar smart contract (https://github.com/friedger/clarity-catamaranswaps/blob/main/contracts/clarity-bitcoin.clar) is a useful template for parsing Bitcoin transactions on the Stacks network. While waiting for the 2.1 update, it is necessary to be able to confirm most of Bitcoin transaction outputs for the purposes of swapping assets. This project seeks to expand the functionalities of the bitcoin.clar smart contract.

This will benefit Bitcoin users who wish to add exposure to Stacks assets trustlessly. This will also benefit apps on Stacks that wish to allow their users to use native Bitcoin to interact with the application.

## Scope

To perform a Catamaran swap, it is important to cover a considerable amount of regular users’ transactions instead of trying to cover every single case (e.g., multiple type input transactions, coinbase transactions, exchanges distributing funds with hundreds of outputs).
The following standard transaction types are by consensus accepted on the Bitcoin network and of interest to perform a Catamaran Swap:

-   P2PKH (Pay-to-pubkey-hash)
-   P2SH (Pay-to-script-hash)
-   P2WPKH (Pay-to-witness-pubkey-hash, V0_Segwit)
-   P2WSH (Pay-to-witness-pubkey-hash, V0_segwit)
-   P2SH-P2WPKH (P2WPKH nested inside P2SH)
-   P2SH-P2WSH (P2WSH nested inside P2SH)
-   P2TR (Pay-to-taproot, V1_segwit, multiple signatures)
-   NULL DATA (OP_RETURN to store data)
-   Multisig is accepted by consensus, but rare.

### Inputs

Because the transaction is assumed to have been accepted by Bitcoin nodes, verifying the values of inputs is not necessary. We’re mostly interested in the output values. The following values need to be accessible in the transaction:

-   Previous transaction hash
-   Previous transaction index
-   ScriptSig
-   Sequence

In the case of a segwit v0, we have witnesses. In segwit v1, the ‘64/65B’ ‘(R.x, s)/(R.x, s, sighashflag)’ signature is accessible as well.

### Outputs

A Catamaran Swap is expected to have up to 3 outputs in the following order to function:

-   Spend output
-   Change output
-   Data output

There are 4 possible output scenarios:

-   [Spend output, Change output]
-   [Spend output, Change output, Data output]
-   [Spend output, Data output]
-   [Spend output]

The following fields are needed:

-   Scriptpubkey to confirm the address to which funds were sent or to get the data
-   Value of the output

The expected format to be used as input is presented here. The following formats are examples and present examples where both inputs and outputs are of the same type. Catamaran Swaps should be able to handle transactions with different output types.

### Verifying transaction inclusion

It is necessary to create three inputs off-chain to verify that a transaction was mined. First, the block header is required to get the merkle proof of inclusion of a transaction. Second, the raw transaction that can be converted into the Transaction ID. Third, the proof necessary to confirm that the Transaction ID is part of the Merkle Tree in the Block Header.

For a reference to the proof, you may consult the bitcoin smart contract used in the previous implementation for an example (Example: https://github.com/friedger/clarity-catamaranswaps/blob/bb552b99ac7abf78c3b4f53b3516e27024595dc9/contracts/clarity-bitcoin.clar#L780). We can observe that a proof requires the index of the transaction in the block, the partial Merkle tree for climbing up the tree to the root and the depth of the tree. In the example given, the maximum depth of the tree is 12. This is acceptable for more blocks because the maximum number of transactions that can be accounted for in a block with a depth of 12 is 4096. However, if more than 4096 transactions are mined in a block, we might not be able to verify that a transaction was mined. For these exceptions, the tree depth should have a capacity of up to 14. There is a case of a block with 12239 transactions (source: https://www.blockchain.com/btc/block/00000000000000001080e6de32add416cd6cda29f35ec9bce694fea4b964c7be)

## Requirements

The Clarity smart contract needs to receive the Transaction as a tuple (Object) that maps to the fields aforementioned for easy access.

The smart contract has to verify that the Transaction exists in the Bitcoin blockchain using proof of an inclusion to a Merkle Tree.

It must be possible for the Transaction to be converted into a raw transaction and then into its transaction ID. This is useful so that the transaction can be considered "confirmed”.

Expected performance is to be 200 verifications per block possible as per SIP-012 performance costs (https://github.com/hirosystems/sips/blob/draft/sip-012/sips/sip-012/sip-012-cost-limits-network-upgrade.md). This is the default in Clarinet code analysis.

## Assumptions

Assumptions about the inputs and outputs of a transaction. Anything else should raise an error:

-   Inputs are of a single type per transaction (although technically possible, will raise complexity of the parsing and is not worth it for general use. Multiple output types are acceptable and common).
-   Is not a coinbase transaction
-   16 maximum inputs (We don’t want to exclude people with a lot of small inputs)
-   3 maximum outputs (1 spend output, 1 change output, 1 data output)

Only communicate with post-Segwit nodes to retrieve raw transactions.

## Budget and Milestones

### Total Grant Request:

#### Milestone 1

Can verify transactions of P2PKH inputs only and P2SH inputs only. Also, should be able to handle the different output scenarios.

Deliverables: Backend code to generate the transaction objects, block header and proof. Clarity contract code to verify P2PKH and P2SH transaction types and be able to access inputs and outputs.

Work hours: 50 hours (transaction processing, processing inputs, processing outputs, transaction verification)

#### Milestone 2

Can verify transactions of type P2WPKH inputs only, P2WSH inputs only, P2PKH-P2SH inputs only, P2WSH-P2SH inputs only.

Deliverables: Clarity contract code to verify P2WPKH, P2WSH, P2PKH-P2SH and P2WSH-P2SH transaction types and be able to access inputs and outputs.

Work hours: 20 hours (transaction verification)

#### Milestone 3

Can verify transactions of type P2TR inputs only.

Deliverables: Clarity contract code to verify P2TR transaction types and be able to access inputs and outputs.

Work hours: 30 hours (transaction verification of less-known transaction type)

## Team

As this is a wishlist grant proposal, it’s yet unclear who will build this.

However, they can count on the support of me (i.e. FriendsFerdinand), Tycho, and Friedger. We are building a cross-chain DeFi application that will leverage Catamaran Swaps as a core part of its functionality. Hence, we have an intimate understanding of what the Catamaran Swap should to do benefit the end user.

Add: engineering & Clarity experience of FriendsFerdinand.

Complete deployment of an NFT project: https://github.com/FriendsFerdinand/lab-experiment

Encrypted text editor for preserving logs: https://github.com/FriendsFerdinand/crypto-editor

Explaining and documenting Clarity contract on Sigle: https://app.sigle.io/friendsferdinand.id.stx

Tycho co-founded a profitable SaaS company and served as it’s COO & Head of Product. He was nominated as a Resident to focus on DeFi by the Stacks Foundation, but decided to work on this cross-chain DeFi application on Stacks instead. He’s also helped out as a Mentor during the Stacks Accelerator’s first cohort and has a solid understanding of the requirements of the other DeFi apps on Stacks.

Friedger is a long-time Stacks community member, deployed the first smart contract on mainnet and performed the first Catamaran Swap.

# Risks

What dependencies or obstacles do you anticipate? What contingency plans do you have in place?

Risk # 1: the developer could lose track of the practical uses of the Catamaran Swaps by users and applications. We can mitigate this risk by making myself and Tycho freely available for questions and advice (we are well positioned to help here as we’re building an application with Catamaran Swaps).

Risk # 2: An unknown risk, the Stacks 2.1 update could prove to be unreliable and we would be in the same position that we currently are. To mitigate this, it’s important to closely follow the issue stacks-network/stacks-blockchain#2663 and ensure its progress towards completion.

Risk # 3: When users create legitimate transactions (legitimate is when the destination address is authorized to spend the expected funds) that fit the size limits that aren’t accepted by the smart contract. To mitigate against this, a thorough testing of transactions should be done. These tests should be based on theoretical possibilities (within the restricted size limits) and the common transactions that are created by most popular software wallets.

Risk # 4: Execution costs of the smart contract become very expensive to be used on the network. It is important to get rid of as much processing time as possible that happens on the smart contract. At the cost of reducing comprehensibility for speed, speed should be prioritized. Continuous testing of performance should be done throughout the development of the smart contract.

## Community and Supporting Materials

In terms of community feedback, Marvin Janssen (Stacks Foundation), Muneeb Ali (Stacks Founder), and developers such as Pseudozach and Asteria have all voiced their support for this upgrade to the Catamaran Swap infrastructure. Additionally, Philip de Smet (Arkadiko), Chiente Hsu (ALEX), and Jamil Dhanani (StacksNFT) mentioned that they would love to see an upgraded version of the Catamaran Swap to explore the possibility of using it in their applications.

The developer working on this grant could share regular updates on this page, and share the updated contract as final deliverable.
