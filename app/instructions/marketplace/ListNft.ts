import { getProgram, tokenTypeEnumToAnchorEnum } from "@helpers/mixins";
import { 
  getCollectionPDA, 
  getMarketEscrowPDA, 
  getMarketEscrowTokenPDA, 
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
  const organization = await getOrganizationPDA(orgName);
  const marketplace = await getMarketplacePDA(
    organization, 
    TokenType.NonFungible
  );
  const escrowAccount = await getMarketEscrowPDA(
    marketplace,
    collection,
    mint,
    publicKey,
  );

  const ix = await program.methods
    .listNft(
      orgName,
      tokenTypeEnumToAnchorEnum(TokenType.NonFungible),
      new BN(price * LAMPORTS_PER_SOL),
    )
    .accounts({
      organization,
      marketplace,
      collectionId: collectionId,
      collection: collection,
      nftMint: mint,
      nftMetadataAccount: await Metadata.getPDA(mint),
      escrowAccount,
      escrowTokenAccount: await getMarketEscrowTokenPDA(
        escrowAccount
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