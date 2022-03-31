import { getProgram, tokenTypeEnumToAnchorEnum } from "@helpers/mixins";
import { getCollectionPDA, getEscrowPDA, getEscrowTokenPDA, getMarketplacePDA } from "@helpers/pdas";
import { NftData, TokenType } from "@helpers/types";
import { Provider, BN } from "@project-serum/anchor";
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from "@solana/web3.js";

export const DelistToken = async (
  provider: Provider,
  mint: PublicKey,
) => {
  const program = getProgram(provider);
  const { publicKey } = provider.wallet;

  const metadata = await Metadata.getPDA(mint);

  const [escrowAccount, b1] = await getEscrowPDA(
    TokenType.Fungible,
    metadata,
    mint,
    publicKey,
  );

  const ix = await program.methods
    .delistToken(
      tokenTypeEnumToAnchorEnum(TokenType.Fungible),
      b1,
    )
    .accounts({
      marketplace: await getMarketplacePDA(TokenType.Fungible),
      tokenMint: mint,
      metadataAccount: metadata,
      escrowAccount: escrowAccount,
      escrowTokenAccount: await getEscrowTokenPDA(
        TokenType.Fungible,
        metadata,
        mint,
        publicKey,
      ),
      sellerTokenAccount: await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        publicKey,
      ),
    })
    .instruction();

  return ix;
}