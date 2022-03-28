import { PublicKey } from "@solana/web3.js"
import { MARKETPLACE_PROGRAM_ADDRESS } from "./constants"

export const getMarketplacePDA = async () => {
  const [marketplace] = await PublicKey.findProgramAddress(
    [
      Buffer.from("marketplace"),
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return marketplace;
}

export const getMarketplaceVaultPDA = async (): Promise<[PublicKey, number]> => {
  const [marketplace, bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from("marketplace-vault"),
      (await getMarketplacePDA()).toBuffer(),
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
      (await getMarketplacePDA()).toBuffer(),
      collectionId.toBuffer()
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return collection;
}

export const getEscrowPDA = async (
  collectionId: PublicKey,
  mint: PublicKey,
  seller: PublicKey,
): Promise<[PublicKey, number]> => {
  const [escrow, bump] = await PublicKey.findProgramAddress(
    [
      Buffer.from("escrow"),
      (await getMarketplacePDA()).toBuffer(),
      (await getCollectionPDA(collectionId)).toBuffer(),
      mint.toBuffer(),
      seller.toBuffer()
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return [escrow, bump];
}

export const getEscrowTokenPDA = async (
  collectionId: PublicKey,
  mint: PublicKey,
  seller: PublicKey,
) => {
  const [escrow] = await PublicKey.findProgramAddress(
    [
      Buffer.from("token-account"),
      (await getEscrowPDA(
        collectionId,
        mint,
        seller,
      ))[0].toBuffer(),
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return escrow;
}