import { getProgram, tokenTypeEnumToAnchorEnum } from "@helpers/mixins";
import { 
  getEscrowPDA, 
  getEscrowTokenPDA, 
  getMarketplacePDA, 
  getMasterVaultPDA, 
  getOrganizationPDA,
  getOrganizationVaultPDA
} from "@helpers/pdas";
import { TokenType } from "@helpers/types";
import { Provider, BN } from "@project-serum/anchor";
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { ParsedAccountData, PublicKey } from "@solana/web3.js";

export const BuyToken = async (
  provider: Provider,
  mint: PublicKey,
  seller: PublicKey,
  amount: number,
  orgName: string,
) => {
  const program = getProgram(provider);
  const { publicKey } = provider.wallet;
  const metadata = await Metadata.getPDA(mint);
  const decimals = ((await provider.connection.getParsedAccountInfo(mint)).value?.data as ParsedAccountData).parsed.info.decimals;

  const ix = await program.methods
    .buyToken(
      orgName,
      tokenTypeEnumToAnchorEnum(TokenType.Fungible),
      new BN(amount * Math.pow(10, decimals)),
    )
    .accounts({
      organization: await getOrganizationPDA(orgName),
      orgVault: await getOrganizationVaultPDA(orgName),
      marketplace: await getMarketplacePDA(orgName, TokenType.Fungible),
      tokenMint: mint,
      metadataAccount: metadata,
      escrowAccount: await getEscrowPDA(
        orgName,
        TokenType.Fungible,
        metadata,
        mint,
        seller,
      ),
      escrowTokenAccount: await getEscrowTokenPDA(
        orgName,
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
      masterVault: await getMasterVaultPDA(),
      seller: seller,
    })
    .instruction();

  return ix;
}