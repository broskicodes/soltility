import { getProgram, tokenTypeEnumToAnchorEnum } from "@helpers/mixins";
import { 
  getCollectionPDA, 
  getMarketEscrowPDA, 
  getMarketEscrowTokenPDA, 
  getMarketplacePDA, 
  getMasterVaultPDA, 
  getOrganizationPDA,
  getOrganizationVaultPDA
} from "@helpers/pdas";
import { TokenType } from "@helpers/types";
import { Provider } from "@project-serum/anchor";
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

  const organization = await getOrganizationPDA(orgName);
  const marketplace = await getMarketplacePDA(
    organization, 
    TokenType.NonFungible
  );
  const escrowAccount = await getMarketEscrowPDA(
    marketplace,
    collection,
    mint,
    seller,
  );

  const ix = await program.methods
    .buyNft(
      orgName,
      tokenTypeEnumToAnchorEnum(TokenType.NonFungible),
    )
    .accounts({
      organization,
      orgVault: await getOrganizationVaultPDA(organization),
      marketplace,
      collectionId: collectionId,
      collection: collection,
      nftMint: mint,
      nftMetadataAccount: mtdtAcnt,
      escrowAccount,
      escrowTokenAccount: await getMarketEscrowTokenPDA(
        escrowAccount,
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