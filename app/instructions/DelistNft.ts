import { getProgram, tokenTypeEnumToAnchorEnum } from "@helpers/mixins";
import { getCollectionPDA, getEscrowPDA, getEscrowTokenPDA, getMarketplacePDA } from "@helpers/pdas";
import { NftData, TokenType } from "@helpers/types";
import { Provider, BN } from "@project-serum/anchor";
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";

export const DelistNft = async (
  provider: Provider,
  mint: PublicKey,
  collectionId: PublicKey,
) => {
  const program = getProgram(provider);
  // const { mint, collectionId } = nft;
  const { publicKey } = provider.wallet;

  const [escrowAccount, bump] = await getEscrowPDA(
    TokenType.Nonfungible,
    collectionId,
    mint,
    publicKey,
  );

  const ix = await program.methods
    .delistNft(
      tokenTypeEnumToAnchorEnum(TokenType.Nonfungible),
      bump,
    )
    .accounts({
      marketplace: await getMarketplacePDA(TokenType.Nonfungible),
      collectionId: collectionId,
      collection: await getCollectionPDA(collectionId),
      nftMint: mint,
      escrowAccount: escrowAccount,
      escrowTokenAccount: await getEscrowTokenPDA(
        TokenType.Nonfungible,
        collectionId,
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