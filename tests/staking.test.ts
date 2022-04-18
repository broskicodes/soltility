// import * as anchor from "@project-serum/anchor";
// import { Program } from "@project-serum/anchor";
// import { MarketplaceAas } from "../target/types/marketplace_aas";
// import { Provider, BN } from "@project-serum/anchor";
// import { getCollectionPDA, getOrganizationPDA, getOrganizationVaultPDA, getStakeEscrowPDA, getStakeEscrowTokenPDA, getStakeVaultPDA } from "./utils/pdas";
// import { Keypair, LAMPORTS_PER_SOL, PublicKey, SYSVAR_CLOCK_PUBKEY } from "@solana/web3.js";
// import { assert } from "chai";
// import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
// import { Metadata } from '@metaplex-foundation/mpl-token-metadata';

// describe("Staking unit test", () => {
//   const provider = anchor.Provider.env();
//   anchor.setProvider(provider);

//   const program = anchor.workspace.MarketplaceAas as Program<MarketplaceAas>;
//   const { publicKey } = provider.wallet;
//   const random = Keypair.generate();

//   it('Fails to initialize stake vault when organization does not exist', async () => {
//     try {
//       const name = Math.random().toString();
//       const organization = await getOrganizationPDA(program.programId, name);
//       const collectionId = new PublicKey('Dfn6BJyWp71hVxVjh28RrejgiFkqix6n7zqn3XwvC9Kc');
//       const collection = await getCollectionPDA(
//         program.programId,
//         collectionId
//       );
//       const stakeVault = await getStakeVaultPDA(
//         program.programId,
//         organization,
//         collection
//       );
//       const rewardMint = new PublicKey("JLH6X6GUoBj9D3MYqoptAwPZT6yZtSyMHV28aMd2GQj");

//       await program.methods
//         .initializeStakingVault(
//           name,
//           3000,
//           10,
//         )
//         .accounts({
//           stakeVault,
//           collection,
//           collectionId,
//           organization,
//           rewardMint,
//         })
//         .rpc()

//     } catch (err) {
//       assert.equal(err.msg, 'The program expected this account to be already initialized');
//       return;
//     }

//     assert.fail("Instruction should have failed due to uninitialized organization account.");
//   });

//   it('Fails to initialize stake vault when collection does not exist', async () => {
//     try {
//       const name = "Name";
//       const organization = await getOrganizationPDA(program.programId, name);
//       const collectionId = Keypair.generate().publicKey;
//       const collection = await getCollectionPDA(
//         program.programId,
//         collectionId
//       );
//       const stakeVault = await getStakeVaultPDA(
//         program.programId,
//         organization,
//         collection
//       );
//       const rewardMint = new PublicKey("JLH6X6GUoBj9D3MYqoptAwPZT6yZtSyMHV28aMd2GQj");

//       await program.methods
//         .initializeStakingVault(
//           name,
//           3000,
//           10,
//         )
//         .accounts({
//           stakeVault,
//           collection,
//           collectionId,
//           organization,
//           rewardMint,
//         })
//         .rpc()

//     } catch (err) {
//       assert.equal(err.msg, 'The program expected this account to be already initialized');
//       return;
//     }

//     assert.fail("Instruction should have failed due to uninitialized collection account.");
//   });

//   it('Fails to initialize stake vault when organization authority does not sign', async () => {
//     try {
//       const name = "Name";
//       const organization = await getOrganizationPDA(program.programId, name);
//       const collectionId = new PublicKey('8wRzRau99nrbcsq2GUVVPkYBSMduzenq8rQEMJJnznvE');
//       const collection = await getCollectionPDA(
//         program.programId,
//         collectionId
//       );
//       const stakeVault = await getStakeVaultPDA(
//         program.programId,
//         organization,
//         collection
//       );
//       const rewardMint = new PublicKey("JLH6X6GUoBj9D3MYqoptAwPZT6yZtSyMHV28aMd2GQj");
//       const orgAuthority = Keypair.generate();

//       await program.methods
//         .initializeStakingVault(
//           name,
//           3000,
//           10,
//         )
//         .accounts({
//           stakeVault,
//           collection,
//           collectionId,
//           organization,
//           rewardMint,
//           orgAuthority: orgAuthority.publicKey
//         })
//         .signers([orgAuthority])
//         .rpc()

//     } catch (err) {
//       assert.equal(err.msg, 'Signing organization authority does not match authority on record.');
//       return;
//     }

//     assert.fail("Instruction should have failed due to organization authority not signing.");
//   });

//   it('Fails to initialize stake vault when mint authority does not sign', async () => {
//     try {
//       const name = "Name";
//       const organization = await getOrganizationPDA(program.programId, name);
//       const collectionId = new PublicKey('8wRzRau99nrbcsq2GUVVPkYBSMduzenq8rQEMJJnznvE');
//       const collection = await getCollectionPDA(
//         program.programId,
//         collectionId
//       );
//       const stakeVault = await getStakeVaultPDA(
//         program.programId,
//         organization,
//         collection
//       );
      
//       const auth = random;
//       let aTx = await provider.connection.requestAirdrop(auth.publicKey, 0.5 * LAMPORTS_PER_SOL);
//       await provider.connection.confirmTransaction(aTx);
//       const rewardMint = await Token.createMint(
//         provider.connection,
//         auth,
//         auth.publicKey,
//         null,
//         2,
//         TOKEN_PROGRAM_ID,
//       );

//       await program.methods
//         .initializeStakingVault(
//           name,
//           3000,
//           10,
//         )
//         .accounts({
//           stakeVault,
//           collection,
//           collectionId,
//           organization,
//           rewardMint: rewardMint.publicKey,
//         })
//         .rpc()

//     } catch (err) {
//       assert.equal(err.msg, "Mint authority of provided reward mint cannot be transferred. Either it is null or current authority has not signed.");
//       return;
//     }

//     assert.fail("Instruction should have failed due to organization authority not signing.");
//   });

//   it('Initializes stake vault', async () => {
//     try {
//       const name = "Name";
//       const organization = await getOrganizationPDA(program.programId, name);
//       const collectionId = new PublicKey('Dfn6BJyWp71hVxVjh28RrejgiFkqix6n7zqn3XwvC9Kc');
//       const collection = await getCollectionPDA(
//         program.programId,
//         collectionId
//       );
//       const stakeVault = await getStakeVaultPDA(
//         program.programId,
//         organization,
//         collection
//       );
      
//       const rewardMint = new PublicKey("JLH6X6GUoBj9D3MYqoptAwPZT6yZtSyMHV28aMd2GQj");

//       await program.methods
//         .initializeStakingVault(
//           name,
//           3000,
//           10,
//         )
//         .accounts({
//           stakeVault,
//           collection,
//           collectionId,
//           organization,
//           rewardMint: rewardMint,
//         })
//         .rpc()

//       const data = await program.account.stakeVault.fetch(stakeVault);

//       assert.equal(data.organization.toString(), organization.toString());
//       assert.equal(data.collection.toString(), collection.toString());
//       assert.equal(data.authority.toString(), publicKey.toString());
//       assert.equal(data.rewardMint.toString(), rewardMint.toString());
//       assert.equal(data.minLockTime, 3000);
//       assert.equal(data.dailyRate, 10);

//     } catch (err) {
//       console.log(err);
//       assert.fail("Failed to initialize stake vault.");
//     }
//   });

//   it('Fails to stake nft when nft not in collection', async () => {
//     try {
//       const name = "Name";
//       const organization = await getOrganizationPDA(program.programId, name);
//       const collectionId = new PublicKey('Dfn6BJyWp71hVxVjh28RrejgiFkqix6n7zqn3XwvC9Kc');
//       const nftMint = new PublicKey("7g14FDLyx6uVuA5VZSYQaHocY2mr7A2Y7smf9vQVruMh");
//       const collection = await getCollectionPDA(
//         program.programId,
//         collectionId
//       );
//       const stakeVault = await getStakeVaultPDA(
//         program.programId,
//         organization,
//         collection
//       );
//       const escrow = await getStakeEscrowPDA(
//         program.programId,
//         stakeVault,
//         publicKey,
//         nftMint,
//       );
//       const escrowToken = await getStakeEscrowTokenPDA(
//         program.programId,
//         escrow,
//       );

//       await program.methods
//         .stakeNft(
//           name,
//         )
//         .accounts({
//           escrowAccount: escrow,
//           escrowTokenAccount: escrowToken,
//           stakeVault,
//           collection,
//           collectionId,
//           organization,
//           nftMint,
//           nftMetadataAccount: await Metadata.getPDA(nftMint),
//           userNftTokenAccount: await Token.getAssociatedTokenAddress(
//             ASSOCIATED_TOKEN_PROGRAM_ID,
//             TOKEN_PROGRAM_ID,
//             nftMint,
//             publicKey,
//             false
//           ),
//           clock: SYSVAR_CLOCK_PUBKEY,
//         })
//         .rpc()

//     } catch (err) {
//       // console.log(err)
//       assert.equal(err.msg, "Passed collection id does not match one obtained from passed mint.");
//       return;
//     }

//     assert.fail("Instruction should have failed due to nft from incorrect collection.");
//   });

//   it('Fails to stake nft when token account empty', async () => {
//     try {
//       const name = "Name";
//       const organization = await getOrganizationPDA(program.programId, name);
//       const collectionId = new PublicKey('Dfn6BJyWp71hVxVjh28RrejgiFkqix6n7zqn3XwvC9Kc');
//       const nftMint = new PublicKey("7FwSBu9bo8rPZ4siWgxovm6DH2kgA2F566T8qogsMs2s");
//       const collection = await getCollectionPDA(
//         program.programId,
//         collectionId
//       );
//       const stakeVault = await getStakeVaultPDA(
//         program.programId,
//         organization,
//         collection
//       );
//       const escrow = await getStakeEscrowPDA(
//         program.programId,
//         stakeVault,
//         publicKey,
//         nftMint,
//       );
//       const escrowToken = await getStakeEscrowTokenPDA(
//         program.programId,
//         escrow,
//       );

//       const payer = random;

//       const tok = new Token(
//         provider.connection,
//         nftMint,
//         TOKEN_PROGRAM_ID,
//         payer,
//       );
//       const userTokenAccount = (await tok.getOrCreateAssociatedAccountInfo(
//         publicKey
//       )).address;

//       await program.methods
//         .stakeNft(
//           name,
//         )
//         .accounts({
//           escrowAccount: escrow,
//           escrowTokenAccount: escrowToken,
//           stakeVault,
//           collection,
//           collectionId,
//           organization,
//           nftMint,
//           nftMetadataAccount: await Metadata.getPDA(nftMint),
//           userNftTokenAccount: userTokenAccount,
//           clock: SYSVAR_CLOCK_PUBKEY,
//         })
//         .rpc()

//     } catch (err) {
//       assert.equal(err.msg, "Provided token account is empty.");
//       return;
//     }

//     assert.fail("Instruction should have failed due to empty token account.");
//   });

//   it('Fails to stake nft when user does not own token account', async () => {
//     try {
//       const name = "Name";
//       const organization = await getOrganizationPDA(program.programId, name);
//       const collectionId = new PublicKey('Dfn6BJyWp71hVxVjh28RrejgiFkqix6n7zqn3XwvC9Kc');
//       const nftMint = new PublicKey("7FwSBu9bo8rPZ4siWgxovm6DH2kgA2F566T8qogsMs2s");
//       const collection = await getCollectionPDA(
//         program.programId,
//         collectionId
//       );
//       const stakeVault = await getStakeVaultPDA(
//         program.programId,
//         organization,
//         collection
//       );
//       const escrow = await getStakeEscrowPDA(
//         program.programId,
//         stakeVault,
//         publicKey,
//         nftMint,
//       );
//       const escrowToken = await getStakeEscrowTokenPDA(
//         program.programId,
//         escrow,
//       );

//       await program.methods
//         .stakeNft(
//           name,
//         )
//         .accounts({
//           escrowAccount: escrow,
//           escrowTokenAccount: escrowToken,
//           stakeVault,
//           collection,
//           collectionId,
//           organization,
//           nftMint,
//           nftMetadataAccount: await Metadata.getPDA(nftMint),
//           userNftTokenAccount: await Token.getAssociatedTokenAddress(
//             ASSOCIATED_TOKEN_PROGRAM_ID,
//             TOKEN_PROGRAM_ID,
//             nftMint,
//             new PublicKey("CrfpUKyn8XhpWfoiGSX6rKpbqpPJZ6QJwaQbBrvZVQrd"),
//             false
//           ),
//           clock: SYSVAR_CLOCK_PUBKEY,
//         })
//         .rpc()

//     } catch (err) {
//       assert.equal(err.msg, "A token owner constraint was violated");
//       return;
//     }

//     assert.fail("Instruction should have failed due to empty token account.");
//   });

//   it('Stakes nft', async () => {
//     try {
//       const name = "Name";
//       const organization = await getOrganizationPDA(program.programId, name);
//       const collectionId = new PublicKey('Dfn6BJyWp71hVxVjh28RrejgiFkqix6n7zqn3XwvC9Kc');
//       const nftMint = new PublicKey("G8VFfsD27RgHpMfKNVeuuayc7VCQDiQTKRsdxm3ZMwyA");
//       const collection = await getCollectionPDA(
//         program.programId,
//         collectionId
//       );
//       const stakeVault = await getStakeVaultPDA(
//         program.programId,
//         organization,
//         collection
//       );
//       const escrow = await getStakeEscrowPDA(
//         program.programId,
//         stakeVault,
//         publicKey,
//         nftMint,
//       );
//       const escrowToken = await getStakeEscrowTokenPDA(
//         program.programId,
//         escrow,
//       );

//       await program.methods
//         .stakeNft(
//           name,
//         )
//         .accounts({
//           escrowAccount: escrow,
//           escrowTokenAccount: escrowToken,
//           stakeVault,
//           collection,
//           collectionId,
//           organization,
//           nftMint,
//           nftMetadataAccount: await Metadata.getPDA(nftMint),
//           userNftTokenAccount: await Token.getAssociatedTokenAddress(
//             ASSOCIATED_TOKEN_PROGRAM_ID,
//             TOKEN_PROGRAM_ID,
//             nftMint,
//             publicKey,
//             false
//           ),
//           clock: SYSVAR_CLOCK_PUBKEY,
//         })
//         .rpc()

//       const data = await program.account.stakeEscrow.fetch(escrow);
//       const dailyRate = (await program.account.stakeVault.fetch(stakeVault)).dailyRate;

//       assert.equal(data.stakeVault.toString(), stakeVault.toString());
//       assert.equal(data.nftMint.toString(), nftMint.toString());
//       assert.equal(data.user.toString(), publicKey.toString());
//       assert.equal(data.dailyRate, dailyRate);
//       assert.equal(data.dailyRate, dailyRate);
//       assert.closeTo(data.startDate.toNumber(), (Date.now() / 1000), 5);
//       assert.equal(data.startDate.toString(), data.lastClaimedDate.toString());
      
//       const tokAcntAmount = await provider.connection.getTokenAccountBalance(escrowToken);
//       assert.equal(tokAcntAmount.value.uiAmount, 1);
//     } catch (err) {
//       console.log(err);
//       assert.fail("Failed to stake nft.");
//     }
//   });

//   it('Fails to collect reward tokens when incorrect reward mint provided', async () => {
//     try {
//       const name = "Name";
//       const organization = await getOrganizationPDA(program.programId, name);
//       const collectionId = new PublicKey('Dfn6BJyWp71hVxVjh28RrejgiFkqix6n7zqn3XwvC9Kc');
//       const nftMint = new PublicKey("G8VFfsD27RgHpMfKNVeuuayc7VCQDiQTKRsdxm3ZMwyA");
//       const collection = await getCollectionPDA(
//         program.programId,
//         collectionId
//       );
//       const stakeVault = await getStakeVaultPDA(
//         program.programId,
//         organization,
//         collection
//       );
//       const escrow = await getStakeEscrowPDA(
//         program.programId,
//         stakeVault,
//         publicKey,
//         nftMint,
//       );
//       const rewardMint = new PublicKey("7g14FDLyx6uVuA5VZSYQaHocY2mr7A2Y7smf9vQVruMh");

//       await program.methods
//         .collectEarnedTokens(
//           name,
//         )
//         .accounts({
//           escrowAccount: escrow,
//           rewardMint,
//           stakeVault,
//           collection,
//           collectionId,
//           organization,
//           nftMint,
//           userRewardTokenAccount: await Token.getAssociatedTokenAddress(
//             ASSOCIATED_TOKEN_PROGRAM_ID,
//             TOKEN_PROGRAM_ID,
//             rewardMint,
//             publicKey,
//             false
//           ),
//           clock: SYSVAR_CLOCK_PUBKEY,
//         })
//         .rpc()

//     } catch (err) {
//       assert.equal(err.msg, "Provided reward mint does not match the mint on record.");
//       return;
//     }

//     assert.fail("Instruction should have failed due to empty token account.");
//   });

//   it('Collects earned reward tokens', async () => {
//     try {
//       const name = "Name";
//       const organization = await getOrganizationPDA(program.programId, name);
//       const collectionId = new PublicKey('Dfn6BJyWp71hVxVjh28RrejgiFkqix6n7zqn3XwvC9Kc');
//       const nftMint = new PublicKey("G8VFfsD27RgHpMfKNVeuuayc7VCQDiQTKRsdxm3ZMwyA");
//       const collection = await getCollectionPDA(
//         program.programId,
//         collectionId
//       );
//       const stakeVault = await getStakeVaultPDA(
//         program.programId,
//         organization,
//         collection
//       );
//       const escrow = await getStakeEscrowPDA(
//         program.programId,
//         stakeVault,
//         publicKey,
//         nftMint,
//       );
//       const rewardMint = new PublicKey("JLH6X6GUoBj9D3MYqoptAwPZT6yZtSyMHV28aMd2GQj");

//       const userRewardTokenAccount = await Token.getAssociatedTokenAddress(
//         ASSOCIATED_TOKEN_PROGRAM_ID,
//         TOKEN_PROGRAM_ID,
//         rewardMint,
//         publicKey,
//         false
//       );

//       let data = await program.account.stakeEscrow.fetch(escrow);

//       const beforeAmnt = (await provider.connection.getTokenAccountBalance(userRewardTokenAccount)).value.uiAmount;
//       let mint_amount 
//         = (((Date.now() / 1000) - data.lastClaimedDate.toNumber())
//         / (60 * 60 * 24)
//         * data.dailyRate);
      
//       await program.methods
//         .collectEarnedTokens(
//           name,
//         )
//         .accounts({
//           escrowAccount: escrow,
//           rewardMint,
//           stakeVault,
//           collection,
//           collectionId,
//           organization,
//           nftMint,
//           userRewardTokenAccount,
//           clock: SYSVAR_CLOCK_PUBKEY,
//         })
//         .rpc()

//       data = await program.account.stakeEscrow.fetch(escrow);

//       assert.closeTo(data.lastClaimedDate.toNumber(), (Date.now() / 1000), 5)

//       const tokAcntAmount = await provider.connection.getTokenAccountBalance(userRewardTokenAccount);
//       assert.closeTo(tokAcntAmount.value.uiAmount, beforeAmnt + mint_amount, 1);

//     } catch (err) {
//       console.log(err);
//       assert.fail("Failed to collect reward tokens.");
//     }
//   });

//   it('Fails to unstake nft if time lock has not ended', async () => {
//     try {
//       const name = "Name";
//       const organization = await getOrganizationPDA(program.programId, name);
//       const collectionId = new PublicKey('Dfn6BJyWp71hVxVjh28RrejgiFkqix6n7zqn3XwvC9Kc');
//       const nftMint = new PublicKey("5kjDwGdJrSzVcHoebbRTM7VSZ9p2f5SHxnsV2nyZrTJb");
//       const collection = await getCollectionPDA(
//         program.programId,
//         collectionId
//       );
//       const stakeVault = await getStakeVaultPDA(
//         program.programId,
//         organization,
//         collection
//       );
//       const escrow = await getStakeEscrowPDA(
//         program.programId,
//         stakeVault,
//         publicKey,
//         nftMint,
//       );
//       const escrowToken = await getStakeEscrowTokenPDA(
//         program.programId,
//         escrow,
//       );

//       await program.methods
//         .stakeNft(
//           name,
//         )
//         .accounts({
//           escrowAccount: escrow,
//           escrowTokenAccount: escrowToken,
//           stakeVault,
//           collection,
//           collectionId,
//           organization,
//           nftMint,
//           nftMetadataAccount: await Metadata.getPDA(nftMint),
//           userNftTokenAccount: await Token.getAssociatedTokenAddress(
//             ASSOCIATED_TOKEN_PROGRAM_ID,
//             TOKEN_PROGRAM_ID,
//             nftMint,
//             publicKey,
//             false
//           ),
//           clock: SYSVAR_CLOCK_PUBKEY,
//         })
//         .rpc()

//       await program.methods
//         .unstakeNft(
//           name,
//         )
//         .accounts({
//           escrowAccount: escrow,
//           escrowTokenAccount: escrowToken,
//           stakeVault,
//           collection,
//           collectionId,
//           organization,
//           nftMint,
//           userNftTokenAccount: await Token.getAssociatedTokenAddress(
//             ASSOCIATED_TOKEN_PROGRAM_ID,
//             TOKEN_PROGRAM_ID,
//             nftMint,
//             publicKey,
//             false
//           ),
//           clock: SYSVAR_CLOCK_PUBKEY,
//         })
//         .rpc()

//     } catch (err) {
//       assert.equal(err.msg, "The locking period for this nft has not ended yet.");
//       return;
//     }

//     assert.fail("Instruction should have failed due to time lock.");
//   });

//   it('Unstakes nft', async () => {
//     try {
//       const name = "Name";
//       const organization = await getOrganizationPDA(program.programId, name);
//       const collectionId = new PublicKey('Dfn6BJyWp71hVxVjh28RrejgiFkqix6n7zqn3XwvC9Kc');
//       const nftMint = new PublicKey("G8VFfsD27RgHpMfKNVeuuayc7VCQDiQTKRsdxm3ZMwyA");
//       const collection = await getCollectionPDA(
//         program.programId,
//         collectionId
//       );
//       const stakeVault = await getStakeVaultPDA(
//         program.programId,
//         organization,
//         collection
//       );
//       const escrow = await getStakeEscrowPDA(
//         program.programId,
//         stakeVault,
//         publicKey,
//         nftMint,
//       );
//       const escrowToken = await getStakeEscrowTokenPDA(
//         program.programId,
//         escrow,
//       );
//       const userNftTokenAccount = await Token.getAssociatedTokenAddress(
//         ASSOCIATED_TOKEN_PROGRAM_ID,
//         TOKEN_PROGRAM_ID,
//         nftMint,
//         publicKey,
//         false
//       );

//       await program.methods
//         .unstakeNft(
//           name,
//         )
//         .accounts({
//           escrowAccount: escrow,
//           escrowTokenAccount: escrowToken,
//           stakeVault,
//           collection,
//           collectionId,
//           organization,
//           nftMint,
//           userNftTokenAccount,
//           clock: SYSVAR_CLOCK_PUBKEY,
//         })
//         .rpc()

//       const tokAcntAmount = await provider.connection.getTokenAccountBalance(userNftTokenAccount);
//       assert.equal(tokAcntAmount.value.uiAmount, 1);

      // try {
      //   await program.account.stakeEscrow.fetch(escrow);
      //   assert.fail("Should have failed to fetch account data.");
      // } catch (err) {
      //   assert.equal(err.message, `Account does not exist ${escrow.toString()}`)
      // }
      
      // const escrowTokAcntInfo = await provider.connection.getParsedAccountInfo(escrowToken);
      // assert.equal(escrowTokAcntInfo.value, null);

//     } catch (err) {
//       console.log(err);
//       assert.fail("Failed to stake nft.");
//     }
//   });
// });