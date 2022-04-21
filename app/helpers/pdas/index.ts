import { PublicKey } from "@solana/web3.js"
import { MARKETPLACE_PROGRAM_ADDRESS } from "@helpers/constants"

export * from './marketplace';
export * from './trading';
export * from './staking';

export const getMasterVaultPDA = async () => {
  const [masterVault] = await PublicKey.findProgramAddress(
    [
      Buffer.from("master-vault"),
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return masterVault;
}

export const getOrganizationPDA = async (name: string) => {
  const [organization] = await PublicKey.findProgramAddress(
    [
      Buffer.from("organization"),
      Buffer.from(name.toString()),
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return organization;
}

export const getOrganizationVaultPDA = async (organization: PublicKey) => {
  const [marketplace] = await PublicKey.findProgramAddress(
    [
      Buffer.from("organization-vault"),
      organization.toBuffer(),
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return marketplace;
}

export const getCollectionPDA = async (
  collectionId: PublicKey,
) => {
  const [collection] = await PublicKey.findProgramAddress(
    [
      Buffer.from("collection"),
      collectionId.toBuffer()
    ],
    MARKETPLACE_PROGRAM_ADDRESS,
  );

  return collection;
}