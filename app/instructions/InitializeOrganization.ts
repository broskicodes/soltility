import { getProgram } from "@helpers/mixins";
import { getOrganizationPDA, getOrganizationVaultPDA } from "@helpers/pdas";
import { Provider } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export const InitilizeOrganization = async (
  provider: Provider,
  orgName: string,
  customVaultAddress?: PublicKey,
) => {
  const program = getProgram(provider);

  const ix = await program.methods
    .initializeOrganization(
      orgName,
      customVaultAddress ? customVaultAddress : null,
    )
    .accounts({
      organization: await getOrganizationPDA(orgName),
      orgVault: await getOrganizationVaultPDA(orgName),
      authority: provider.wallet.publicKey,
    })
    .instruction();

  return ix;
}