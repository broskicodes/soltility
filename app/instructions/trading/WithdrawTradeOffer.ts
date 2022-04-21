import { getOfferingRemainingAccounts, getProgram } from "@helpers/mixins";
import { getTradeStatePDA } from "@helpers/pdas";
import { Provider } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export const WithdrawTradeOffer = async (
  provider: Provider,
  escrow: PublicKey,
) => {
  const program = getProgram(provider);
  const { publicKey } = provider.wallet;

  const globalState = await getTradeStatePDA();
  const escrowData = await program.account.tradeEscrow.fetch(escrow);

  const remainingAccounts = await getOfferingRemainingAccounts(
    escrowData.tokensOffering,
    publicKey,
    escrow,
  );

  const ix = await program.methods
    .withdrawTradeOffer(
      escrowData.nonce,
    )
    .accounts({
      globalState,
      escrowAccount: escrow,
    })
    .remainingAccounts(remainingAccounts)
    .instruction()

  return ix;
}