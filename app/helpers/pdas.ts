import { PublicKey } from "@solana/web3.js"
import { MARKETPLACE_PROGRAM_ADDRESS } from "./constants"
import { TokenType } from "./types";

export const getMarketplacePDA = async (type: TokenType) => {
  const [marketplace] = await PublicKey.findProgramAddress(
    [
      Buffer.from("marketplace"),
      Buffer.from([type])
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return marketplace;
}

export const getMarketplaceVaultPDA = async (type: TokenType): Promise<[PublicKey, number]> => {
  const [marketplace, bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from("marketplace-vault"),
      (await getMarketplacePDA(type)).toBuffer(),
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return [marketplace, bump];
}

export const getCollectionPDA = async (
  collectionId: PublicKey,
) => {
  const [collection] = await PublicKey.findProgramAddress(
    [
      Buffer.from("collection"),
      (await getMarketplacePDA(TokenType.NonFungible)).toBuffer(),
      collectionId.toBuffer()
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return collection;
}

export const getEscrowPDA = async (
  type: TokenType,
  colOrMeta: PublicKey,
  mint: PublicKey,
  seller: PublicKey,
): Promise<[PublicKey, number]> => {
  const [escrow, bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from("escrow"),
      (await getMarketplacePDA(type)).toBuffer(),
      colOrMeta.toBuffer(),
      mint.toBuffer(),
      seller.toBuffer()
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return [escrow, bump];
}

export const getEscrowTokenPDA = async (
  type: TokenType,
  colOrMeta: PublicKey,
  mint: PublicKey,
  seller: PublicKey,
) => {
  const [escrow] = await PublicKey.findProgramAddress(
    [
      Buffer.from("token-account"),
      (await getEscrowPDA(
        type,
        colOrMeta,
        mint,
        seller,
      ))[0].toBuffer(),
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return escrow;
}