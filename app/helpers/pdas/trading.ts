import { PublicKey } from "@solana/web3.js"
import { MARKETPLACE_PROGRAM_ADDRESS } from "@helpers/constants"
import BN from "bn.js";

export const getTradeStatePDA = async () => {
  const [tradeState] = await PublicKey.findProgramAddress(
    [
      Buffer.from("global-trade-state"),
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return tradeState;
}

export const getTradeEscrowPDA = async (
  tradeState: PublicKey,
  offerer: PublicKey,
  escrowNonce: BN,
) => {
  const [escrow] = await PublicKey.findProgramAddress(
    [
      Buffer.from("trade-escrow"),
      tradeState.toBuffer(),
      offerer.toBuffer(),
      Buffer.from(new Uint8Array(escrowNonce.toArray("le", 8))),
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return escrow;
}

export const getTradeEscrowTokenPDA = async (
  escrow: PublicKey,
  mint: PublicKey,
) => {
  const [escrowToken] = await PublicKey.findProgramAddress(
    [
      Buffer.from("token-account"),
      escrow.toBuffer(),
      mint.toBuffer(),
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return escrowToken;
}