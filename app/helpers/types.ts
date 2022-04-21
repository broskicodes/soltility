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

export interface MasterVaultData {
  authority: PublicKey,
  // Basis points
  fee: number,
}

export interface OrganizationData {
  authority: PublicKey,
  name: string,
  custom_vault?: PublicKey,
}

export interface MarketplaceData {
  token_type: TokenType,
  organization: PublicKey,
  update_authority: PublicKey,
  // In basis points
  fee: number,
  is_mutable: boolean,
}

export interface CollectionData {
  version: CandyMachineVersion,
  collectionId: PublicKey,
  name: string
};

export interface EscrowAccountData {
  tokenType: TokenType,
  marketplace: PublicKey,
  collection?: PublicKey,
  metadata?: PublicKey,
  seller: PublicKey,
  mint: PublicKey,
  tokenAccount: PublicKey,
  pricePerToken: number,
}

export interface TokenOffering {
  amount: BN,
  mint?: PublicKey,
  collection?: PublicKey,
}