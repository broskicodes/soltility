import { getProgram, tokenTypeEnumToAnchorEnum } from "@helpers/mixins";
import { getMarketplacePDA, getMarketplaceVaultPDA } from "@helpers/pdas";
import { TokenType } from "@helpers/types";
import { Provider } from "@project-serum/anchor";

export const InitilizeMarketplace = async (
  provider: Provider,
  type: TokenType,
  fee: number,
  isMutable: boolean,
) => {
  const program = getProgram(provider);

  const ix = await program.methods
    .initializeMarketplace(
      tokenTypeEnumToAnchorEnum(type),
      fee,
      isMutable,
    )
    .accounts({
      marketplace: await getMarketplacePDA(type),
      marketplaceVault: (await getMarketplaceVaultPDA(type))[0],
    })
    .instruction();

  return ix;
}