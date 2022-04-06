import { PublicKey } from "@solana/web3.js"
import { MARKETPLACE_PROGRAM_ADDRESS } from "./constants"
import { TokenType } from "./types";

export const getMasterVaultPDA = async () => {
  const [masterVault] = await PublicKey.findProgramAddress(
    [
      Buffer.from("master-vault"),
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return masterVault;
}

export const getOrganizationPDA = async (name: string) => {
  const [organization] = await PublicKey.findProgramAddress(
    [
      Buffer.from("organization"),
      Buffer.from(name.toString()),
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return organization;
}

export const getOrganizationVaultPDA = async (name: string) => {
  const [marketplace] = await PublicKey.findProgramAddress(
    [
      Buffer.from("organization-vault"),
      (await getOrganizationPDA(name)).toBuffer(),
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return marketplace;
}

export const getMarketplacePDA = async (
  name: string,
  type: TokenType,
) => {
  const [marketplace] = await PublicKey.findProgramAddress(
    [
      Buffer.from("marketplace"),
      (await getOrganizationPDA(name)).toBuffer(),
      Buffer.from([type])
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return marketplace;
}

export const getCollectionPDA = async (
  collectionId: PublicKey,
) => {
  const [collection] = await PublicKey.findProgramAddress(
    [
      Buffer.from("collection"),
      collectionId.toBuffer()
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return collection;
}

export const getEscrowPDA = async (
  orgName: string,
  type: TokenType,
  colOrMeta: PublicKey,
  mint: PublicKey,
  seller: PublicKey,
 ) => {
  const [escrow] = await PublicKey.findProgramAddress(
    [
      Buffer.from("escrow"),
      (await getMarketplacePDA(orgName, type)).toBuffer(),
      colOrMeta.toBuffer(),
      mint.toBuffer(),
      seller.toBuffer()
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return escrow;
}

export const getEscrowTokenPDA = async (
  orgName: string,
  type: TokenType,
  colOrMeta: PublicKey,
  mint: PublicKey,
  seller: PublicKey,
) => {
  const [escrow] = await PublicKey.findProgramAddress(
    [
      Buffer.from("token-account"),
      (await getEscrowPDA(
        orgName,
        type,
        colOrMeta,
        mint,
        seller,
      )).toBuffer(),
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return escrow;
}