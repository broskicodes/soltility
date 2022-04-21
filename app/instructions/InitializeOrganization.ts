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

  const organization = await getOrganizationPDA(orgName);

  const ix = await program.methods
    .initializeOrganization(
      orgName,
      customVaultAddress ? customVaultAddress : null,
    )
    .accounts({
      organization,
      orgVault: await getOrganizationVaultPDA(organization),
      authority: provider.wallet.publicKey,
    })
    .instruction();

  return ix;
}