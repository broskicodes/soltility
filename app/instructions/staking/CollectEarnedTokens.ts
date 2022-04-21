import { getProgram } from "@helpers/mixins";
import { 
  getCollectionPDA, 
  getOrganizationPDA, 
  getStakeEscrowPDA, 
  getStakeVaultPDA 
} from "@helpers/pdas";
import { Provider } from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { PublicKey, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";

export const CollectEarnedTokens = async (
  provider: Provider,
  collectionId: PublicKey,
  nftMint: PublicKey,
  rewardMint: PublicKey,
  orgName: string,
) => {
  const program = getProgram(provider);
  const { publicKey } = provider.wallet;

  const organization = await getOrganizationPDA(orgName);
  const collection = await getCollectionPDA(
    collectionId
  );
  const stakeVault = await getStakeVaultPDA(
    organization,
    collection
  );
  const escrow = await getStakeEscrowPDA(
    stakeVault,
    publicKey,
    nftMint,
  );
  const userRewardTokenAccount = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    rewardMint,
    publicKey,
    false
  );

  const ix = await program.methods
    .collectEarnedTokens(
      orgName,
    )
    .accounts({
      escrowAccount: escrow,
      rewardMint,
      stakeVault,
      collection,
      collectionId,
      organization,
      nftMint,
      userRewardTokenAccount,
      clock: SYSVAR_CLOCK_PUBKEY,
    })
    .instruction()

  return ix;
}