import { PublicKey } from "@solana/web3.js"
import { MARKETPLACE_PROGRAM_ADDRESS } from "@helpers/constants"

export const getStakeVaultPDA = async (
  organization: PublicKey,
  collection: PublicKey,
) => {
  const [stakeVault] = await PublicKey.findProgramAddress(
    [
      Buffer.from("stake-vault"),
      organization.toBuffer(),
      collection.toBuffer(),
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return stakeVault;
}

export const getStakeEscrowPDA = async (
  stakeVault: PublicKey,
  user: PublicKey,
  mint: PublicKey,
) => {
  const [escrow] = await PublicKey.findProgramAddress(
    [
      Buffer.from("stake-escrow"),
      stakeVault.toBuffer(),
      user.toBuffer(),
      mint.toBuffer(),
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return escrow;
}

export const getStakeEscrowTokenPDA = async (
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