import { getProgram, tokenTypeEnumToAnchorEnum } from "@helpers/mixins";
import { 
  getEscrowPDA, 
  getEscrowTokenPDA, 
  getMarketplacePDA, 
  getOrganizationPDA
} from "@helpers/pdas";
import { TokenType } from "@helpers/types";
import { Provider, BN } from "@project-serum/anchor";
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { 
  LAMPORTS_PER_SOL, 
  ParsedAccountData, 
  PublicKey 
} from "@solana/web3.js";

export const ListToken = async (
  provider: Provider,
  mint: PublicKey,
  pricePerToken: number, 
  amount: number, 
  orgName: string,
) => {
  const program = getProgram(provider);
  const { publicKey } = provider.wallet;

  const metadata = await Metadata.getPDA(mint);
  
  const mintInfo = await provider.connection.getParsedAccountInfo(mint);

  const decimals = mintInfo.value 
    ? (mintInfo.value?.data as ParsedAccountData).parsed.info.decimals
    : 6;

  const ix = await program.methods
    .listToken(
      orgName,
      tokenTypeEnumToAnchorEnum(TokenType.Fungible),
      new BN(pricePerToken * LAMPORTS_PER_SOL),
      new BN(amount * Math.pow(10, decimals)),
    )
    .accounts({
      organization: await getOrganizationPDA(orgName),
      marketplace: await getMarketplacePDA(orgName, TokenType.Fungible),
      tokenMint: mint,
      metadataAccount: metadata,
      escrowAccount: (await getEscrowPDA(
        orgName,
        TokenType.Fungible,
        metadata,
        mint,
        publicKey,
      )),
      escrowTokenAccount: await getEscrowTokenPDA(
        orgName,
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