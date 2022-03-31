import { getProgram, tokenTypeEnumToAnchorEnum } from "@helpers/mixins";
import { getCollectionPDA, getEscrowPDA, getEscrowTokenPDA, getMarketplacePDA, getMarketplaceVaultPDA } from "@helpers/pdas";
import { NftData, TokenType } from "@helpers/types";
import { Provider, BN } from "@project-serum/anchor";
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";

export const BuyNft = async (
  provider: Provider,
  mint: PublicKey,
  collectionId: PublicKey,
  seller: PublicKey,
) => {
  const program = getProgram(provider);
  // const { mint, collectionId } = nft;
  const { publicKey } = provider.wallet;

  const collection = await getCollectionPDA(collectionId);

  const [escrowAccount, b1] = await getEscrowPDA(
    TokenType.NonFungible,
    collection,
    mint,
    seller,
  );
  const [marketplaceVault, b2] = await getMarketplaceVaultPDA(TokenType.NonFungible);

  const mtdtAcnt = await Metadata.getPDA(mint);
  const metadata = await Metadata.load(provider.connection, mtdtAcnt);

  const remAcnts = metadata.data.data.creators
    ? metadata.data.data.creators
      .filter((creator) => {
        return creator.share > 0;
      })
      .map((creator) => {
        return {
          pubkey: new PublicKey(creator.address),
          isWritable: true,
          isSigner: false,
        }
      })
    : [];

  const ix = await program.methods
    .buyNft(
      tokenTypeEnumToAnchorEnum(TokenType.NonFungible),
      b1,
    )
    .accounts({
      marketplace: await getMarketplacePDA(TokenType.NonFungible),
        collectionId: collectionId,
        collection: collection,
        nftMint: mint,
        nftMetadataAccount: mtdtAcnt,
        escrowAccount: escrowAccount,
        escrowTokenAccount: await getEscrowTokenPDA(
          TokenType.NonFungible,
          collection,
          mint,
          seller,
        ),
        buyerNftTokenAccount: await Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          mint,
          publicKey,
        ),
        marketplaceVault: marketplaceVault,
        seller: seller,
    })
    .remainingAccounts(remAcnts)
    .instruction();

  return ix;
}