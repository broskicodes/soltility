import { PublicKey } from "@solana/web3.js"
import { MARKETPLACE_PROGRAM_ADDRESS } from "@helpers/constants"
import { TokenType } from "@helpers/types";
import { getOrganizationPDA } from ".";

export const getMarketplacePDA = async (
  organization: PublicKey,
  type: TokenType,
) => {
  const [marketplace] = await PublicKey.findProgramAddress(
    [
      Buffer.from("marketplace"),
      organization.toBuffer(),
      Buffer.from([type])
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return marketplace;
}

export const getMarketEscrowPDA = async (
  marketplace: PublicKey,
  colOrMeta: PublicKey,
  mint: PublicKey,
  seller: PublicKey,
 ) => {
  const [escrow] = await PublicKey.findProgramAddress(
    [
      Buffer.from("market-escrow"),
      marketplace.toBuffer(),
      colOrMeta.toBuffer(),
      mint.toBuffer(),
      seller.toBuffer()
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return escrow;
}

export const getMarketEscrowTokenPDA = async (
  escrow: PublicKey,
  ) => {
    const [escrowToken] = await PublicKey.findProgramAddress(
      [
        Buffer.from("token-account"),
        escrow.toBuffer(),
      ],
      MARKETPLACE_PROGRAM_ADDRESS,
    );
  
    return escrowToken;
}