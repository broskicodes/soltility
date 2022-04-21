import { getOfferingRemainingAccounts, getProgram, getRequestingRemainingAccounts } from "@helpers/mixins";
import { getTradeStatePDA } from "@helpers/pdas";
import { Provider } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export const FulfillTradeOffer = async (
  provider: Provider,
  fulfilligMints: PublicKey[],
  escrow: PublicKey,
  offerer: PublicKey
) => {
  const program = getProgram(provider);
  const { publicKey } = provider.wallet;

  const globalState = await getTradeStatePDA();
  const escrowData = await program.account.tradeEscrow.fetch(escrow);

  const remainingAccounts = [
    await getRequestingRemainingAccounts(
      fulfilligMints,
      offerer,
      publicKey,
    ),
    await getOfferingRemainingAccounts(
      escrowData.tokensOffering,
      publicKey,
      escrow,
    ),
  ].flat();

  const ix = await program.methods
    .fulfillTradeOffer(
      escrowData.nonce,
    )
    .accounts({
      globalState,
      escrowAccount: escrow,
      offerer,
    })
    .remainingAccounts(remainingAccounts)
    .instruction()

  return ix;
}