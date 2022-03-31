import { getProgram, tokenTypeEnumToAnchorEnum } from "@helpers/mixins";
import { getCollectionPDA, getEscrowPDA, getEscrowTokenPDA, getMarketplacePDA } from "@helpers/pdas";
import { NftData, TokenType } from "@helpers/types";
import { Provider, BN } from "@project-serum/anchor";
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const ListNft = async (
  provider: Provider,
  nft: NftData,
  price: number,  
) => {
  const program = getProgram(provider);
  const { mint, collectionId } = nft;
  const { publicKey } = provider.wallet;

  const collection = await getCollectionPDA(collectionId);

  const ix = await program.methods
    .listNft(
      tokenTypeEnumToAnchorEnum(TokenType.NonFungible),
      new BN(price * LAMPORTS_PER_SOL),
    )
    .accounts({
      marketplace: await getMarketplacePDA(TokenType.NonFungible),
      collectionId: collectionId,
      collection: collection,
      nftMint: mint,
      nftMetadataAccount: await Metadata.getPDA(mint),
      escrowAccount: (await getEscrowPDA(
        TokenType.NonFungible,
        collection,
        mint,
        publicKey,
      ))[0],
      escrowTokenAccount: await getEscrowTokenPDA(
        TokenType.NonFungible,
        collection,
        mint,
        publicKey,
      ),
      sellerNftTokenAccount: await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        publicKey,
      ),
    })
    .instruction();

  return ix;
}