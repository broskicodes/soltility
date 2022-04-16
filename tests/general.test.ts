// import * as anchor from "@project-serum/anchor";
// import { Program } from "@project-serum/anchor";
// import { MarketplaceAas } from "../target/types/marketplace_aas";
// import { Provider, BN } from "@project-serum/anchor";
// import { getCollectionPDA, getMasterVaultPDA, getOrganizationPDA, getOrganizationVaultPDA } from "./utils/pdas";
// import * as assert from 'assert';
// import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
// import { CandyMachineVersion } from "../app/helpers/types";
// import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
// import { anchorVersionToEnum, candyMachineVersionToAnchorEnum } from "./utils/mixins";
// import { TOKEN_METADATA_PROGRAM_ADDRESS } from "./utils/types";
// import { Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

// describe("Unit tests", () => {
//   const provider = anchor.Provider.env();
//   anchor.setProvider(provider);

//   const program = anchor.workspace.MarketplaceAas as Program<MarketplaceAas>;
  // const { publicKey } = provider.wallet;

//   it('Fails to initializes master vault when fee is too high', async () => {
//     try {
//       const masterVault = await getMasterVaultPDA(program.programId);

//       await program.methods
//         .initializeMasterVault(10001)
//         .accounts({
//           masterVault,
//         })
//         .rpc();

//       const data = await program.account.masterVault.fetch(masterVault);

//       assert.equal(data.authority.toString(), publicKey.toString());
//       assert.equal(data.fee, 100001);

//     } catch (err) {
//       assert.equal(err.msg, 'Invalid fee, must be in basis points.');
//       return;
//     }

//     assert.fail('Instruction should have failed due to high basis fee.');
//   });

//   // // Will only work the first time after the contract is deployed to a new address
//   // it('Initializes master vault', async () => {
//   //   try {
//   //     const masterVault = await getMasterVaultPDA(program.programId);

//   //     await program.methods
//   //       .initializeMasterVault(250)
//   //       .accounts({
//   //         masterVault,
//   //       })
//   //       .rpc();

//   //     const data = await program.account.masterVault.fetch(masterVault);

//   //     assert.equal(data.authority.toString(), publicKey.toString());
//   //     assert.equal(data.fee, 250);

//   //   } catch (err) {
//   //     console.log(err);
//   //     assert.fail("Failed to create master vault.");
//   //   }
//   // });

//   // it('Fails to re-initializes master vault', async () => {
//   //   try {
//   //     await program.methods
//   //       .initializeMasterVault(250)
//   //       .accounts({
//   //         masterVault: await getMasterVaultPDA(program.programId)
//   //       })
//   //       .rpc()
//   //   } catch (err) {
//   //     assert.equal(err.message, 'failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0');
//   //     return;
//   //   }

//   //   assert.fail('Instruction should have failed due to account re-initialization.');
//   // });

//   it("Creates default organization", async () => {
//     try {
//       const name = Math.random().toString();
//       const org = await getOrganizationPDA(
//         program.programId,
//         name
//       );
      // const orgVault = await getOrganizationVaultPDA(
      //   program.programId,
      //   org,
      // );
      // await program.methods
      //   .initializeOrganization(name, null)
      //   .accounts({
      //     organization: org,
      //     orgVault,
      //   })
      //   .rpc()
      
//       const data = await program.account.organization.fetch(org);

//       assert.equal(data.name, name);
//       assert.equal(data.authority.toString(), publicKey.toString());
//       assert.equal(data.customVault, null);

//     } catch (err) {
//       console.log(err);
//       assert.fail("Failed to create organization.");
//     }
//   });

//   it("Fails to create organization with custom vault when account info not provided", async () => {
//     try {
//       const name = Math.random().toString();
//       const org = await getOrganizationPDA(
//         program.programId,
//         name
//       );
//       const orgVault = await getOrganizationVaultPDA(
//         program.programId,
//         org,
//       );
//       const vault = Keypair.generate();

//       await program.methods
//         .initializeOrganization(name, vault.publicKey)
//         .accounts({
//           organization: org,
//           orgVault,
//         })
//         .rpc()
      
//     } catch (err) {
//       assert.equal(err.msg, 'Missing required account info to execute instruction.');
//       return;
//     }

//     assert.fail("Instruction should have failed due to missing remaining account info.");
//   });

//   it("Fails to create organization with custom vault when wrong remaining account is passed.", async () => {
//     try {
//       const name = Math.random().toString();
//       const org = await getOrganizationPDA(
//         program.programId,
//         name
//       );
//       const orgVault = await getOrganizationVaultPDA(
//         program.programId,
//         org,
//       );
//       const vault = Keypair.generate();
//       const random = Keypair.generate();

//       await program.methods
//         .initializeOrganization(name, vault.publicKey)
//         .accounts({
//           organization: org,
//           orgVault,
//         })
//         .remainingAccounts([
//           {
//             pubkey: random.publicKey,
//             isWritable: false,
//             isSigner: false,
//           }
//         ])
//         .rpc()

//     } catch (err) {
//       assert.equal(err.msg, "Passed vault account info does not match key argument passed to instruction.");
//       return;
//     }

//     assert.fail("Instruction should have failed due to incorrect reamining account info.");
//   });

//   it("Fails to create organization with custom vault when vault does not sign.", async () => {
//     try {
//       const name = Math.random().toString();
//       const org = await getOrganizationPDA(
//         program.programId,
//         name
//       );
//       const orgVault = await getOrganizationVaultPDA(
//         program.programId,
//         org,
//       );
//       const vault = Keypair.generate();

//       await program.methods
//         .initializeOrganization(name, vault.publicKey)
//         .accounts({
//           organization: org,
//           orgVault,
//         })
//         .remainingAccounts([
//           {
//             pubkey: vault.publicKey,
//             isWritable: false,
//             isSigner: false,
//           }
//         ])
//         .rpc()
      
//     } catch (err) {
//       assert.equal(err.message, "failed to send transaction: Transaction simulation failed: Error processing Instruction 0: missing required signature for instruction");
//       return;
//     }

//     assert.fail("Instruction should have failed due to missing vault signiture.");
//   });

//   it("Creates organization with custom vault", async () => {
//     try {
//       const name = Math.random().toString();
//       const org = await getOrganizationPDA(
//         program.programId,
//         name
//       );
//       const orgVault = await getOrganizationVaultPDA(
//         program.programId,
//         org,
//       );
//       const vault = Keypair.generate();

//       await program.methods
//         .initializeOrganization(name, vault.publicKey)
//         .accounts({
//           organization: org,
//           orgVault,
//         })
//         .remainingAccounts([
//           {
//             pubkey: vault.publicKey,
//             isWritable: false,
//             isSigner: true,
//           }
//         ])
//         .signers([vault])
//         .rpc()
      
//       const data = await program.account.organization.fetch(org);

//       assert.equal(data.name, name);
//       assert.equal(data.authority.toString(), publicKey.toString());
//       assert.equal(data.customVault.toString(), vault.publicKey.toString());

//     } catch (err) {
//       console.log(err);
//       assert.fail("Failed to create organization.");
//     }
//   });

//   it('Fails to create second organization with same name.', async () => {
//     try {
//       const name = "Name";
//       const org = await getOrganizationPDA(
//         program.programId,
//         name
//       );
//       const orgVault = await getOrganizationVaultPDA(
//         program.programId,
//         org,
//       );
//       await program.methods
//         .initializeOrganization(name, null)
//         .accounts({
//           organization: org,
//           orgVault,
//         })
//         .rpc()

//     } catch (err) {
//       assert.equal(err.message, 'failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0');
//       return;
//     }

//     assert.fail('Instruction should have failed due to account re-initialization.');
//   });

//   it('Fails to register collection when mint is incorrect.', async () => {
//     try {
//       const name = "V1 Collection";
//       const collectionId = new PublicKey('8wRzRau99nrbcsq2GUVVPkYBSMduzenq8rQEMJJnznvE');
//       const nftMint = new PublicKey('7CkxdUAHh3inswZdxkE1nu7ZV5GBjURpS5NWVjPaBppy');

//       const collection = await getCollectionPDA(
//         program.programId,
//         collectionId,
//       );
//       await program.methods
//         .registerStandardCollection(
//           candyMachineVersionToAnchorEnum(CandyMachineVersion.V1),
//           name,
//         )
//         .accounts({
//           collection,
//           collectionId,
//           nftMint,
//           metadataAccount: await Metadata.getPDA(nftMint),
//         })
//         .rpc()

//     } catch (err) {
//       assert.equal(err.msg, "Passed collection id does not match one obtained from passed mint.");
//       return;
//     }

//     assert.fail('Instruction should have failed due to mint not being from collection.');
//   });

//   it('Fails to register collection when mint is missing creators/collectin.', async () => {
//     try {
//       const name = "V2 Collection";
//       const collectionId = new PublicKey('Dfn6BJyWp71hVxVjh28RrejgiFkqix6n7zqn3XwvC9Kc');
//       const nftMint = new PublicKey('69Biq1dexoL2bGdZco2aJVJJqEGvdrXEqmnjgT5VqqLh');

//       const collection = await getCollectionPDA(
//         program.programId,
//         collectionId,
//       );
//       await program.methods
//         .registerStandardCollection(
//           candyMachineVersionToAnchorEnum(CandyMachineVersion.V2),
//           name,
//         )
//         .accounts({
//           collection,
//           collectionId,
//           nftMint,
//           metadataAccount: await Metadata.getPDA(nftMint),
//         })
//         .rpc()

//     } catch (err) {
//       assert.equal(err.msg, "Passed collection id does not match one obtained from passed mint.");
//       return;
//     }

//     assert.fail('Instruction should have failed due to mint not having collection account.');
//   });

//   it('Fails to register collection when collectionId is incorrect.', async () => {
//     try {
//       const name = "V1 Collection";
//       const collectionId = new PublicKey('HrwuViYPemkfcBw7oA1HbaY75KMVHem2dYcxgDcUaL7a');
//       const nftMint = new PublicKey('GjmJQ1jzosEvohPmMBBKrfdyp4eKbBqTUM1k5ydMEwqn');

//       const collection = await getCollectionPDA(
//         program.programId,
//         collectionId,
//       );
//       await program.methods
//         .registerStandardCollection(
//           candyMachineVersionToAnchorEnum(CandyMachineVersion.V1),
//           name,
//         )
//         .accounts({
//           collection,
//           collectionId,
//           nftMint,
//           metadataAccount: await Metadata.getPDA(nftMint),
//         })
//         .rpc()

//     } catch (err) {
//       assert.equal(err.msg, "Passed collection id does not match one obtained from passed mint.");
//       return;
//     }

//     assert.fail('Instruction should have failed due to collectionId being incorrect.');
//   });

//   // it('Registers v1 collection', async () => {
//   //   try {
//   //     const name = "V1 Collection";
//   //     const collectionId = new PublicKey('8wRzRau99nrbcsq2GUVVPkYBSMduzenq8rQEMJJnznvE');
//   //     const nftMint = new PublicKey('GjmJQ1jzosEvohPmMBBKrfdyp4eKbBqTUM1k5ydMEwqn');

//   //     const collection = await getCollectionPDA(
//   //       program.programId,
//   //       collectionId,
//   //     );
//   //     await program.methods
//   //       .registerStandardCollection(
//   //         candyMachineVersionToAnchorEnum(CandyMachineVersion.V1),
//   //         name,
//   //       )
//   //       .accounts({
//   //         collection,
//   //         collectionId,
//   //         nftMint,
//   //         metadataAccount: await Metadata.getPDA(nftMint),
//   //       })
//   //       .rpc()

//   //     const data = await program.account.collection.fetch(collection);
      
//   //     assert.equal(data.name, name);
//   //     assert.equal(data.collectionId.toString(), collectionId.toString());
//   //     assert.equal(anchorVersionToEnum(data.version), CandyMachineVersion.V1);

//   //   } catch (err) {
//   //     console.log(err);
//   //     assert.fail('Failed to register collection.');
//   //   }
//   // });

//   // it('Registers v2 collection', async () => {
//   //   try {
//   //     const name = "V2 Collection";
//       // const collectionId = new PublicKey('Dfn6BJyWp71hVxVjh28RrejgiFkqix6n7zqn3XwvC9Kc');
//   //     const nftMint = new PublicKey('GjmJQ1jzosEvohPmMBBKrfdyp4eKbBqTUM1k5ydMEwqn');

//   //     const collection = await getCollectionPDA(
//   //       program.programId,
//   //       collectionId,
//   //     );
//   //     await program.methods
//   //       .registerStandardCollection(
//   //         candyMachineVersionToAnchorEnum(CandyMachineVersion.V2),
//   //         name,
//   //       )
//   //       .accounts({
//   //         collection,
//   //         collectionId,
//   //         nftMint,
//   //         metadataAccount: await Metadata.getPDA(nftMint),
//   //       })
//   //       .rpc()

//   //     const data = await program.account.collection.fetch(collection);
      
//   //     assert.equal(data.name, name);
//   //     assert.equal(data.collectionId.toString(), collectionId.toString());
//   //     assert.equal(anchorVersionToEnum(data.version), CandyMachineVersion.V2);

//   //   } catch (err) {
//   //     console.log(err);
//   //     assert.fail('Failed to register collection.');
//   //   }
//   // });

//   // it('Fails to re-register second collection with same collection id', async () => {
//   //   try {
//   //     const name = "V2 Collection";
//   //     const collectionId = new PublicKey('Dfn6BJyWp71hVxVjh28RrejgiFkqix6n7zqn3XwvC9Kc');
//   //     const nftMint = new PublicKey('GjmJQ1jzosEvohPmMBBKrfdyp4eKbBqTUM1k5ydMEwqn');

//   //     const collection = await getCollectionPDA(
//   //       program.programId,
//   //       collectionId,
//   //     );
//   //     await program.methods
//   //       .registerStandardCollection(
//   //         candyMachineVersionToAnchorEnum(CandyMachineVersion.V2),
//   //         name,
//   //       )
//   //       .accounts({
//   //         collection,
//   //         collectionId,
//   //         nftMint,
//   //         metadataAccount: await Metadata.getPDA(nftMint),
//   //       })
//   //       .rpc()

//   //   } catch (err) {
//   //     assert.equal(err.message, 'failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x0');
//   //     return;
//   //   }

//   //   assert.fail('Instruction should have failed due to account re-initialization.');
//   // });
// });