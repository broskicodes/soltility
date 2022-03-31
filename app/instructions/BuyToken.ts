import { getProgram, tokenTypeEnumToAnchorEnum } from "@helpers/mixins";
import { getCollectionPDA, getEscrowPDA, getEscrowTokenPDA, getMarketplacePDA, getMarketplaceVaultPDA } from "@helpers/pdas";
import { NftData, TokenType } from "@helpers/types";
import { Provider, BN } from "@project-serum/anchor";
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { ParsedAccountData, PublicKey } from "@solana/web3.js";

export const BuyToken = async (
  provider: Provider,
  mint: PublicKey,
  seller: PublicKey,
  amount: number,
) => {
  const program = getProgram(provider);
  const { publicKey } = provider.wallet;

  const metadata = await Metadata.getPDA(mint);
  const decimals = ((await provider.connection.getParsedAccountInfo(mint)).value?.data as ParsedAccountData).parsed.info.decimals;

  const [escrowAccount, b1] = await getEscrowPDA(
    TokenType.Fungible,
    metadata,
    mint,
    seller,
  );
  const [marketplaceVault, b2] = await getMarketplaceVaultPDA(TokenType.Fungible);

  const ix = await program.methods
    .buyToken(
      tokenTypeEnumToAnchorEnum(TokenType.Fungible),
      b1,
      new BN(amount * Math.pow(10, decimals)),
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
        seller,
      ),
      buyerTokenAccount: await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        publicKey,
      ),
      marketplaceVault: marketplaceVault,
      seller: seller,
    })
    .instruction();

  return ix;
}