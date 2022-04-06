import { getProgram, tokenTypeEnumToAnchorEnum } from "@helpers/mixins";
import { 
  getCollectionPDA, 
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
import { PublicKey } from "@solana/web3.js";

export const BuyNft = async (
  provider: Provider,
  mint: PublicKey,
  collectionId: PublicKey,
  seller: PublicKey,
  orgName: string,
) => {
  const program = getProgram(provider);
  const { publicKey } = provider.wallet;
  const collection = await getCollectionPDA(collectionId);
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
      orgName,
      tokenTypeEnumToAnchorEnum(TokenType.NonFungible),
    )
    .accounts({
      organization: await getOrganizationPDA(orgName),
      orgVault: await getOrganizationVaultPDA(orgName),
      marketplace: await getMarketplacePDA(orgName, TokenType.NonFungible),
      collectionId: collectionId,
      collection: collection,
      nftMint: mint,
      nftMetadataAccount: mtdtAcnt,
      escrowAccount: await getEscrowPDA(
        orgName,
        TokenType.NonFungible,
        collection,
        mint,
        seller,
      ),
      escrowTokenAccount: await getEscrowTokenPDA(
        orgName,
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
      masterVault: await getMasterVaultPDA(),
      seller: seller,
    })
    .remainingAccounts(remAcnts)
    .instruction();

  return ix;
}