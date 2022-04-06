import { candyMachineVersionToAnchorEnum, getProgram } from "@helpers/mixins";
import { getCollectionPDA } from "@helpers/pdas";
import { CandyMachineVersion } from "@helpers/types";
import { Provider } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

export const RegisterStandardCollection = async (
  provider: Provider,
  collectionId: PublicKey,
  nftMint: PublicKey,
  name: string,
  candyMachineVersion: CandyMachineVersion,
) => {
  const program = getProgram(provider);

  const ix = await program.methods
    .registerStandardCollection(
      candyMachineVersionToAnchorEnum(candyMachineVersion),
      name,
    )
    .accounts({
      collectionId: collectionId,
      collection: await getCollectionPDA(collectionId),
      nftMint: nftMint,
      metadataAccount: await Metadata.getPDA(nftMint),
    })
    .instruction();

  return ix;
}