import { getProgram, tokenTypeEnumToAnchorEnum } from "@helpers/mixins";
import { 
  getMarketEscrowPDA, 
  getMarketEscrowTokenPDA, 
  getMarketplacePDA, 
  getOrganizationPDA
} from "@helpers/pdas";
import { TokenType } from "@helpers/types";
import { Provider } from "@project-serum/anchor";
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from "@solana/web3.js";

export const DelistToken = async (
  provider: Provider,
  mint: PublicKey,
  orgName: string,
) => {
  const program = getProgram(provider);
  const { publicKey } = provider.wallet;
  const metadata = await Metadata.getPDA(mint);

  const organization = await getOrganizationPDA(orgName);
  const marketplace = await getMarketplacePDA(
    organization, 
    TokenType.NonFungible
  );
  const escrowAccount = await getMarketEscrowPDA(
    marketplace,
    metadata,
    mint,
    publicKey,
  );

  const ix = await program.methods
    .delistToken(
      orgName,
      tokenTypeEnumToAnchorEnum(TokenType.Fungible),
    )
    .accounts({
      organization,
      marketplace,
      tokenMint: mint,
      metadataAccount: metadata,
      escrowAccount,
      escrowTokenAccount: await getMarketEscrowTokenPDA(
        escrowAccount,
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