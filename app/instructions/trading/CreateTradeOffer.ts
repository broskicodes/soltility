import { getOfferingRemainingAccounts, getProgram } from "@helpers/mixins";
import { getTradeEscrowPDA, getTradeStatePDA } from "@helpers/pdas";
import { TokenOffering } from "@helpers/types";
import { Provider, BN } from "@project-serum/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const CreateTradeOffer = async (
  provider: Provider,
  tokensOffering: TokenOffering[],
  tokensRequesting: TokenOffering[],
  solOffering: number,
  solRequesting: number,
) => {
  const program = getProgram(provider);
  const { publicKey } = provider.wallet;

  const globalState = await getTradeStatePDA();
  const escrowNonce = (await program.account.globalTradeState.fetch(globalState)).nextEscrowNonce;
  const escrow = await getTradeEscrowPDA(
    globalState,
    publicKey,
    escrowNonce,
  );

  const remainingAccounts = await getOfferingRemainingAccounts(
    tokensOffering,
    publicKey,
    escrow,
  );

  const ix = await program.methods
    .createTradeOffer(
      escrowNonce,
      tokensOffering,
      tokensRequesting,
      new BN(solOffering * LAMPORTS_PER_SOL),
      new BN(solRequesting * LAMPORTS_PER_SOL),
      null,
    )
    .accounts({
      globalState,
      escrowAccount: escrow,
    })
    .remainingAccounts(remainingAccounts)
    .instruction()

  return ix;
}