import { PublicKey } from "@solana/web3.js";
import { BN } from "@project-serum/anchor"

export enum CandyMachineVersion {
  V1,
  V2,
  Other,
};

export enum TokenType {
  NonFungible,
  Fungible,
  Other,
};

export interface NftData {
  mint: PublicKey,
  collectionId: PublicKey,
  metadata: any,
  imageSrc: string,
};

export interface CollectionData {
  version: CandyMachineVersion,
  collectionId: PublicKey,
  name: string
};

export interface EscrowAccountData {
  active: boolean,
  marketplace: PublicKey,
  collection?: PublicKey,
  metadata?: PublicKey,
  seller: PublicKey,
  mint: PublicKey,
  tokenAccount: PublicKey,
  pricePerToken: number,
}