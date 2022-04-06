import { getProgram, tokenTypeEnumToAnchorEnum } from "@helpers/mixins";
import { 
  getCollectionPDA, 
  getEscrowPDA, 
  getEscrowTokenPDA, 
  getMarketplacePDA, 
  getOrganizationPDA
} from "@helpers/pdas";
import { NftData, TokenType } from "@helpers/types";
import { Provider, BN } from "@project-serum/anchor";
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const ListNft = async (
  provider: Provider,
  nft: NftData,
  price: number,
  orgName: string,
) => {
  const program = getProgram(provider);
  const { mint, collectionId } = nft;
  const { publicKey } = provider.wallet;

  const collection = await getCollectionPDA(collectionId);

  const ix = await program.methods
    .listNft(
      orgName,
      tokenTypeEnumToAnchorEnum(TokenType.NonFungible),
      new BN(price * LAMPORTS_PER_SOL),
    )
    .accounts({
      organization: await getOrganizationPDA(orgName),
      marketplace: await getMarketplacePDA(orgName, TokenType.NonFungible),
      collectionId: collectionId,
      collection: collection,
      nftMint: mint,
      nftMetadataAccount: await Metadata.getPDA(mint),
      escrowAccount: await getEscrowPDA(
        orgName,
        TokenType.NonFungible,
        collection,
        mint,
        publicKey,
      ),
      escrowTokenAccount: await getEscrowTokenPDA(
        orgName,
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