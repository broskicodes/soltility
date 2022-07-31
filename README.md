## On Hiatus!! Checkout [Candy Shop](https://github.com/LIQNFT/candy-shop) by [LIQNFT](https://candy.liqnft.com/) instead

## **Soltility**
### Introduction
A suite of tools for Solana NFT projects, organizations and DAOs to use in their communities to extract more value for their NFTs. The goal of this project is to provide customizable, open source solutions that work out of the box for common tools that each NFT project typically has to build itself. This repo will aim to provide solutions to things like staking, marketplace creation, auctions, asset trading etc. All of this will be open to anyone who wishes to use them to easily easily integrate them within their own NFT project. This will allow these projects to focus on building the things that truly make them unique, rather than spending time re-inventing the wheel just to keep up with other projects in the space.

### Contracts
#### Marketplace
Allows organizations to create unique marketplaces for trade of their assets. Supports sale of NFTs and Fungible SPL-tokens.
##### Features:
- Create a new marketplace for a given organization. Each individual marketplace will either support fungible or non-fungible assets.
- Register various NFT collections that can be listed on the marketplace.
- List NFTs or Tokens (depending on marketplace type) for sale on marketplace
- Delist Nfts/Tokens that you have previously listed
- Buy listed NFTs/tokens on the marketplace

#### Trading
Facilitates peer-to peer trading of on-chain SPL-tokens (fungible and non-fungible). Users can create offers for 2 types of trades: 
- Direct trades to individuals they would like to trade with
- General trades seeking arbitrary nfts from a chosen collection or amounts of fungible SPL-tokens that anybody is able to accept

##### Features:
- Create direct or general trade offer
- Withdraw trade offers you have previously created
- Browse and fulfill trade offers that have been made, either to you directly or generally to anyone
#### Staking
Simple staking contract that allows any organization to create a staking vault for their own NFT collection with a unique reward mint. Various vault settings can be configured by the organization, including the locking period, amount of token earned daily per NFT etc.
##### Features:
- Create a staking vault that can be used to facilitate staking for a given collection and reward mint
- Stake an NFT from the given collection
- Collect earned reward tokens based on staking parameters and time staked
- Unstake a staked NFT
