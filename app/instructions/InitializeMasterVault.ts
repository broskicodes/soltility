import { getProgram } from "@helpers/mixins";
import { getMasterVaultPDA } from "@helpers/pdas";
import { Provider } from "@project-serum/anchor";

export const InitilizeMasterVault = async (
  provider: Provider,
  fee: number,
) => {
  const program = getProgram(provider);

  const ix = await program.methods
    .initializeMasterVault(
      fee,
    )
    .accounts({
      masterVault: await getMasterVaultPDA(),
      authority: provider.wallet.publicKey,
    })
    .instruction();

  return ix;
}