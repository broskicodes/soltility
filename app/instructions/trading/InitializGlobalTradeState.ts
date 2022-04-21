import { getProgram } from "@helpers/mixins";
import { getTradeStatePDA } from "@helpers/pdas";
import { Provider } from "@project-serum/anchor";

export const InitializeGlobalTradeState = async (
  provider: Provider,
) => {
  const program = getProgram(provider);
  // const { publicKey } = provider.wallet;

  const globalState = await getTradeStatePDA();

  const ix = await program.methods
    .initializeGlobalTradeState()
    .accounts({
      globalState,
    })
    .instruction()

  return ix;
}