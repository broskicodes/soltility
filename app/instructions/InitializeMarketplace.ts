import { getProgram } from "@helpers/mixins";
import { getMarketplacePDA } from "@helpers/pdas";
import { Provider } from "@project-serum/anchor";

export const InitilizeMarketplace = async (
  provider: Provider,
) => {
  const program = getProgram(provider);

  const ix = await program.methods
    .initializeMarketplace()
    .accounts({
      marketplace: await getMarketplacePDA(),
    })
    .instruction();

  return ix;
}