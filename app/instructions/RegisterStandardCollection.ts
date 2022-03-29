import { candyMachineVersionToAnchorEnum, getProgram, tokenTypeEnumToAnchorEnum } from "@helpers/mixins";
import { getCollectionPDA, getMarketplacePDA } from "@helpers/pdas";
import { CandyMachineVersion, TokenType } from "@helpers/types";
import { Provider, BN } from "@project-serum/anchor";
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
      tokenTypeEnumToAnchorEnum(TokenType.Nonfungible),
      candyMachineVersionToAnchorEnum(candyMachineVersion),
      name,
    )
    .accounts({
      marketplace: await getMarketplacePDA(TokenType.Nonfungible),
      collectionId: collectionId,
      collection: await getCollectionPDA(collectionId),
      nftMint: nftMint,
      metadataAccount: await Metadata.getPDA(nftMint),
    })
    .instruction();

  return ix;
}