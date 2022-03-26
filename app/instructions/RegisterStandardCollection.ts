import { getProgram } from "@helpers/mixins";
import { getCollectionPDA, getMarketplacePDA } from "@helpers/pdas";
import { Provider, BN } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export const RegisterStandardCollection = async (
  provider: Provider,
  collectionId: PublicKey,
  name: string,
  size: number,
  hashListLink: string,
) => {
  const program = getProgram(provider);

  const ix = await program.methods
    .registerStandardCollection(
      { 'v2': {} },
      name,
      size,
      hashListLink
    )
    .accounts({
      marketplace: await getMarketplacePDA(),
      collectionId: collectionId,
      collection: await getCollectionPDA(collectionId),
    })
    .instruction();

  return ix;
}