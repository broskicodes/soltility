import { getProgram } from "@helpers/mixins";
import { 
  getCollectionPDA, 
  getOrganizationPDA, 
  getStakeVaultPDA 
} from "@helpers/pdas";
import { Provider } from "@project-serum/anchor";
import { PublicKey } from "@solana/web3.js";

export const InitializeStakingVault = async (
  provider: Provider,
  collectionId: PublicKey,
  rewardMint: PublicKey,
  orgName: string,
  minLockTime: number,
  dailyRate: number,
) => {
  const program = getProgram(provider);
  // const { publicKey } = provider.wallet;

  const organization = await getOrganizationPDA(orgName);
  const collection = await getCollectionPDA(
    collectionId
  );
  const stakeVault = await getStakeVaultPDA(
    organization,
    collection
  );
  
  const ix = await program.methods
    .initializeStakingVault(
      orgName,
      minLockTime,
      dailyRate,
    )
    .accounts({
      stakeVault,
      collection,
      collectionId,
      organization,
      rewardMint,
    })
    .instruction()

  return ix;
}