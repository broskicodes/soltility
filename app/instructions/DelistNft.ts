import { getProgram, tokenTypeEnumToAnchorEnum } from "@helpers/mixins";
import { 
  getCollectionPDA, 
  getEscrowPDA, 
  getEscrowTokenPDA, 
  getMarketplacePDA, 
  getOrganizationPDA
} from "@helpers/pdas";
import { TokenType } from "@helpers/types";
import { Provider } from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey } from "@solana/web3.js";

export const DelistNft = async (
  provider: Provider,
  mint: PublicKey,
  collectionId: PublicKey,
  orgName: string,
) => {
  const program = getProgram(provider);
  const { publicKey } = provider.wallet;
  const collection = await getCollectionPDA(collectionId);

  const ix = await program.methods
    .delistNft(
      orgName,
      tokenTypeEnumToAnchorEnum(TokenType.NonFungible),
    )
    .accounts({
      organization: await getOrganizationPDA(orgName),
      marketplace: await getMarketplacePDA(orgName, TokenType.NonFungible),
      collectionId: collectionId,
      collection: collection,
      nftMint: mint,
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