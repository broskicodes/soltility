import { getProgram, tokenTypeEnumToAnchorEnum } from "@helpers/mixins";
import { getMarketplacePDA, getOrganizationPDA } from "@helpers/pdas";
import { TokenType } from "@helpers/types";
import { Provider } from "@project-serum/anchor";

export const InitilizeMarketplace = async (
  provider: Provider,
  type: TokenType,
  fee: number,
  isMutable: boolean,
  orgName: string,
) => {
  const program = getProgram(provider);
  const { publicKey } = provider.wallet;

  const organization = await getOrganizationPDA(orgName);
  const marketplace = await getMarketplacePDA(
    organization, 
    TokenType.NonFungible
  );

  const ix = await program.methods
    .initializeMarketplace(
      orgName,
      tokenTypeEnumToAnchorEnum(type),
      fee,
      isMutable,
    )
    .accounts({
      marketplace,
      organization,
      orgAuthority: publicKey,
      updateAuthority: publicKey,
    })
    .instruction();

  return ix;
}