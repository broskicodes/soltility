import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { MarketplaceAas } from "../target/types/marketplace_aas";
import { Provider, BN } from "@project-serum/anchor";
import { getTradeEscrowPDA, getTradeEscrowTokenPDA, getTradeStatePDA } from "./utils/pdas";
import { assert } from "chai";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";

describe("Trading unit test", () => {
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MarketplaceAas as Program<MarketplaceAas>;
  const { publicKey } = provider.wallet;
  // it('Initializes global trade state', async () => {
  //   try {
  //     const globalState = await getTradeStatePDA(program.programId);

  //     await program.methods
  //       .initializeGlobalTradeState()
  //       .accounts({
  //         globalState,
  //       })
  //       .rpc()

  //   } catch(err) {
  //     console.log(err);
  //     assert.fail("Failed to initialize trade state.");
  //   }
  // });

  it('Fails to create empty trade offer', async () => {
    try {
      const globalState = await getTradeStatePDA(program.programId);
      const escrowNonce = (await program.account.globalTradeState.fetch(globalState)).nextEscrowNonce;
      const escrow = await getTradeEscrowPDA(
        program.programId,
        globalState,
        publicKey,
        escrowNonce,
      );

      await program.methods
        .createTradeOffer(
          escrowNonce,
          [],
          [],
          null,
          null,
          null,
        )
        .accounts({
          globalState,
          escrowAccount: escrow,
        })
        .rpc()

    } catch(err) {
      // console.log(err);
      assert.equal(err.msg, "Nothing to trade.");
      return;
    }

    assert.fail("Instruction should have failed due to trade being empty.");
  });

  it('Fails to create trade offer when escrow nonce is wrong', async () => {
    try {
      const globalState = await getTradeStatePDA(program.programId);
      const escrowNonce = new BN(1001);
      const escrow = await getTradeEscrowPDA(
        program.programId,
        globalState,
        publicKey,
        escrowNonce,
      );

      await program.methods
        .createTradeOffer(
          escrowNonce,
          [],
          [],
          null,
          null,
          null,
        )
        .accounts({
          globalState,
          escrowAccount: escrow,
        })
        .rpc()

    } catch(err) {
      // console.log(err);
      assert.equal(err.msg, "Provided escrow nonce does not match expected value.");
      return;
    }

    assert.fail("Instruction should have failed due to incorrect escrow nonce.");
  });

  it('Fails to create trade offer when too many tokens requested/offered', async () => {
    try {
      const globalState = await getTradeStatePDA(program.programId);
      const escrowNonce =  (await program.account.globalTradeState.fetch(globalState)).nextEscrowNonce;
      const escrow = await getTradeEscrowPDA(
        program.programId,
        globalState,
        publicKey,
        escrowNonce,
      );

      const tokensRequesting = [
        {
          amount: new BN(10 * Math.pow(10, 6)),
          mint: new PublicKey("9HtP8WKuGNLBtizDu8BaiFqtdBPiG5G4oWRQeSLknFSr"),
          collection: null,
        },
        {
          amount: new BN(10 * Math.pow(10, 6)),
          mint: new PublicKey("9HtP8WKuGNLBtizDu8BaiFqtdBPiG5G4oWRQeSLknFSr"),
          collection: null,
        },
        {
          amount: new BN(10 * Math.pow(10, 6)),
          mint: new PublicKey("9HtP8WKuGNLBtizDu8BaiFqtdBPiG5G4oWRQeSLknFSr"),
          collection: null,
        },
        {
          amount: new BN(10 * Math.pow(10, 6)),
          mint: new PublicKey("9HtP8WKuGNLBtizDu8BaiFqtdBPiG5G4oWRQeSLknFSr"),
          collection: null,
        },
        {
          amount: new BN(10 * Math.pow(10, 6)),
          mint: new PublicKey("9HtP8WKuGNLBtizDu8BaiFqtdBPiG5G4oWRQeSLknFSr"),
          collection: null,
        },
        {
          amount: new BN(10 * Math.pow(10, 6)),
          mint: new PublicKey("9HtP8WKuGNLBtizDu8BaiFqtdBPiG5G4oWRQeSLknFSr"),
          collection: null,
        },
      ];

      await program.methods
        .createTradeOffer(
          escrowNonce,
          [],
          tokensRequesting,
          null,
          null,
          null,
        )
        .accounts({
          globalState,
          escrowAccount: escrow,
        })
        .rpc()

    } catch(err) {
      // console.log(err);
      assert.equal(err.msg, "Too many tokens in either offerings or requestings array.");
      return;
    }

    assert.fail("Instruction should have failed due to too many tokens.");
  });

  it('Fails to create trade offer when offeree is self', async () => {
    try {
      const globalState = await getTradeStatePDA(program.programId);
      const escrowNonce = (await program.account.globalTradeState.fetch(globalState)).nextEscrowNonce;
      const escrow = await getTradeEscrowPDA(
        program.programId,
        globalState,
        publicKey,
        escrowNonce,
      );

      await program.methods
        .createTradeOffer(
          escrowNonce,
          [],
          [],
          new BN (1),
          null,
          publicKey,
        )
        .accounts({
          globalState,
          escrowAccount: escrow,
        })
        .rpc()

    } catch(err) {
      // console.log(err);
      assert.equal(err.msg, "Cannot propose trade with yourself.");
      return;
    }

    assert.fail("Instruction should have failed due to attempt to trade with self.");
  });

  it('Fails to create trade offer when mint info does not match', async () => {
    try {
      const globalState = await getTradeStatePDA(program.programId);
      const escrowNonce = (await program.account.globalTradeState.fetch(globalState)).nextEscrowNonce;
      const escrow = await getTradeEscrowPDA(
        program.programId,
        globalState,
        publicKey,
        escrowNonce,
      );

      const tokenOfferings = [
        {
          amount: new BN(10 * Math.pow(10, 6)),
          mint: new PublicKey("9HtP8WKuGNLBtizDu8BaiFqtdBPiG5G4oWRQeSLknFSr"),
          collection: null,
        }
      ];

      const remainingAccounts = (await Promise.all(tokenOfferings.map(async (offering) => {
        return [
          {
            pubkey: new PublicKey("7g14FDLyx6uVuA5VZSYQaHocY2mr7A2Y7smf9vQVruMh"),
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: await Token.getAssociatedTokenAddress(
              ASSOCIATED_TOKEN_PROGRAM_ID,
              TOKEN_PROGRAM_ID,
              offering.mint,
              publicKey,
              false
            ),
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: await getTradeEscrowTokenPDA(
              program.programId,
              escrow,
              offering.mint
            ),
            isSigner: false,
            isWritable: true,
          }
        ];
      }))).flat();

      await program.methods
        .createTradeOffer(
          escrowNonce,
          tokenOfferings,
          [],
          null,
          null,
          null,
        )
        .accounts({
          globalState,
          escrowAccount: escrow,
        })
        .remainingAccounts(remainingAccounts)
        .rpc()

    } catch(err) {
      // console.log(err);
      assert.equal(err.msg, "Passed remaining accounts array does not contain the expected accounts.");
      return;
    }

    assert.fail("Instruction should have failed due to incorrect mint info.");
  });
  
  it('Fails to create trade offer when user token account info does not match', async () => {
    try {
      const globalState = await getTradeStatePDA(program.programId);
      const escrowNonce = (await program.account.globalTradeState.fetch(globalState)).nextEscrowNonce;
      const escrow = await getTradeEscrowPDA(
        program.programId,
        globalState,
        publicKey,
        escrowNonce,
      );

      const tokenOfferings = [
        {
          amount: new BN(10 * Math.pow(10, 6)),
          mint: new PublicKey("9HtP8WKuGNLBtizDu8BaiFqtdBPiG5G4oWRQeSLknFSr"),
          collection: null,
        }
      ];

      const remainingAccounts = (await Promise.all(tokenOfferings.map(async (offering) => {
        return [
          {
            pubkey: offering.mint,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: await Token.getAssociatedTokenAddress(
              ASSOCIATED_TOKEN_PROGRAM_ID,
              TOKEN_PROGRAM_ID,
              new PublicKey("7g14FDLyx6uVuA5VZSYQaHocY2mr7A2Y7smf9vQVruMh"),
              publicKey,
              false
            ),
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: await getTradeEscrowTokenPDA(
              program.programId,
              escrow,
              offering.mint
            ),
            isSigner: false,
            isWritable: true,
          }
        ];
      }))).flat();

      await program.methods
        .createTradeOffer(
          escrowNonce,
          tokenOfferings,
          [],
          null,
          null,
          null,
        )
        .accounts({
          globalState,
          escrowAccount: escrow,
        })
        .remainingAccounts(remainingAccounts)
        .rpc()

    } catch(err) {
      // console.log(err);
      assert.equal(err.msg, "Passed remaining accounts array does not contain the expected accounts.");
      return;
    }

    assert.fail("Instruction should have failed due to incorrect user token account info.");
  });

  it('Fails to create trade offer when escrow token account info does not match', async () => {
    try {
      const globalState = await getTradeStatePDA(program.programId);
      const escrowNonce = (await program.account.globalTradeState.fetch(globalState)).nextEscrowNonce;
      const escrow = await getTradeEscrowPDA(
        program.programId,
        globalState,
        publicKey,
        escrowNonce,
      );

      const tokenOfferings = [
        {
          amount: new BN(10 * Math.pow(10, 6)),
          mint: new PublicKey("9HtP8WKuGNLBtizDu8BaiFqtdBPiG5G4oWRQeSLknFSr"),
          collection: null,
        }
      ];

      const remainingAccounts = (await Promise.all(tokenOfferings.map(async (offering) => {
        return [
          {
            pubkey: offering.mint,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: await Token.getAssociatedTokenAddress(
              ASSOCIATED_TOKEN_PROGRAM_ID,
              TOKEN_PROGRAM_ID,
              offering.mint,
              publicKey,
              false
            ),
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: await getTradeEscrowTokenPDA(
              program.programId,
              escrow,
              new PublicKey("7g14FDLyx6uVuA5VZSYQaHocY2mr7A2Y7smf9vQVruMh"),
            ),
            isSigner: false,
            isWritable: true,
          }
        ];
      }))).flat();

      await program.methods
        .createTradeOffer(
          escrowNonce,
          tokenOfferings,
          [],
          null,
          null,
          null,
        )
        .accounts({
          globalState,
          escrowAccount: escrow,
        })
        .remainingAccounts(remainingAccounts)
        .rpc()

    } catch(err) {
      // console.log(err);
      assert.equal(err.msg, "Passed remaining accounts array does not contain the expected accounts.");
      return;
    }

    assert.fail("Instruction should have failed due to incorrect escrow token account info.");
  });

  it('Fails to create trade offer when offerings list contains duplicate mints', async () => {
    try {
      const globalState = await getTradeStatePDA(program.programId);
      const escrowNonce = (await program.account.globalTradeState.fetch(globalState)).nextEscrowNonce;
      const escrow = await getTradeEscrowPDA(
        program.programId,
        globalState,
        publicKey,
        escrowNonce,
      );

      const tokenOfferings = [
        {
          amount: new BN(10 * Math.pow(10, 6)),
          mint: new PublicKey("9HtP8WKuGNLBtizDu8BaiFqtdBPiG5G4oWRQeSLknFSr"),
          collection: null,
        },
        {
          amount: new BN(10 * Math.pow(10, 6)),
          mint: new PublicKey("9HtP8WKuGNLBtizDu8BaiFqtdBPiG5G4oWRQeSLknFSr"),
          collection: null,
        },
      ];

      const remainingAccounts = (await Promise.all(tokenOfferings.map(async (offering) => {
        return [
          {
            pubkey: offering.mint,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: await Token.getAssociatedTokenAddress(
              ASSOCIATED_TOKEN_PROGRAM_ID,
              TOKEN_PROGRAM_ID,
              offering.mint,
              publicKey,
              false
            ),
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: await getTradeEscrowTokenPDA(
              program.programId,
              escrow,
              offering.mint,
            ),
            isSigner: false,
            isWritable: true,
          }
        ];
      }))).flat();

      await program.methods
        .createTradeOffer(
          escrowNonce,
          tokenOfferings,
          [],
          null,
          null,
          null,
        )
        .accounts({
          globalState,
          escrowAccount: escrow,
        })
        .remainingAccounts(remainingAccounts)
        .rpc()

    } catch(err) {
      // console.log(err);
      assert.equal(err.msg, "Offerings list contains duplicate mint keys.");
      return;
    }

    assert.fail("Instruction should have failed due to incorrect escrow token account info.");
  });

  it('Create sol for _ trade offer', async () => {
    try {
      const globalState = await getTradeStatePDA(program.programId);
      const escrowNonce = (await program.account.globalTradeState.fetch(globalState)).nextEscrowNonce;
      const escrow = await getTradeEscrowPDA(
        program.programId,
        globalState,
        publicKey,
        escrowNonce,
      );
      const solAmnt = 0.01 * LAMPORTS_PER_SOL;

      await program.methods
        .createTradeOffer(
          escrowNonce,
          [],
          [],
          new BN(solAmnt),
          null,
          null,
        )
        .accounts({
          globalState,
          escrowAccount: escrow,
        })
        .rpc()

      const data = await program.account.tradeEscrow.fetch(escrow);

      assert.equal(data.nonce.toNumber(), escrowNonce.toNumber());
      assert.equal(data.offerer.toString(), publicKey.toString());
      assert.deepEqual(data.tokensOffering, []);
      assert.deepEqual(data.tokensRequesting, []);
      assert.deepEqual(data.lamportsOffering.toNumber(), solAmnt);
      assert.equal(data.lamportsRequesting, null);
      assert.equal(data.offeree, null);

      const nextEscrowNonce = (await program.account.globalTradeState.fetch(globalState)).nextEscrowNonce;
      assert.deepEqual(nextEscrowNonce.toNumber(), escrowNonce.add(new BN(1)).toNumber());

      const info = (await provider.connection.getAccountInfo(escrow));
      const rent = await provider.connection.getMinimumBalanceForRentExemption(info.data.length);
      assert.equal(info.lamports, rent + solAmnt);
      
    } catch(err) {
      console.log(err);
      assert.fail("Failed to create sol for _ trade offer");
    }
  });

  it('Create tokens for _ trade offer', async () => {
    try {
      const globalState = await getTradeStatePDA(program.programId);
      const escrowNonce = (await program.account.globalTradeState.fetch(globalState)).nextEscrowNonce;
      const escrow = await getTradeEscrowPDA(
        program.programId,
        globalState,
        publicKey,
        escrowNonce,
      );

      const tokenOfferings = [
        {
          amount: new BN(10 * Math.pow(10, 6)),
          mint: new PublicKey("9HtP8WKuGNLBtizDu8BaiFqtdBPiG5G4oWRQeSLknFSr"),
          collection: null,
        }
      ];

      const remainingAccounts = (await Promise.all(tokenOfferings.map(async (offering) => {
        return [
          {
            pubkey: offering.mint,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: await Token.getAssociatedTokenAddress(
              ASSOCIATED_TOKEN_PROGRAM_ID,
              TOKEN_PROGRAM_ID,
              offering.mint,
              publicKey,
              false
            ),
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: await getTradeEscrowTokenPDA(
              program.programId,
              escrow,
              offering.mint
            ),
            isSigner: false,
            isWritable: true,
          }
        ];
      }))).flat();

      await program.methods
        .createTradeOffer(
          escrowNonce,
          tokenOfferings,
          [],
          null,
          null,
          null,
        )
        .accounts({
          globalState,
          escrowAccount: escrow,
        })
        .remainingAccounts(remainingAccounts)
        .rpc()

      const data = await program.account.tradeEscrow.fetch(escrow);

      assert.equal(data.nonce.toNumber(), escrowNonce.toNumber());
      assert.equal(data.offerer.toString(), publicKey.toString());
      assert.notDeepEqual(data.tokensOffering, []);
      assert.deepEqual(data.tokensRequesting, []);
      assert.equal(data.lamportsOffering, null);
      assert.equal(data.lamportsRequesting, null);
      assert.equal(data.offeree, null);

      tokenOfferings.forEach((offering) => {
        getTradeEscrowTokenPDA(
          program.programId,
          escrow,
          offering.mint
        ).then((tokAcnt) => {
          provider.connection.getTokenAccountBalance(
            tokAcnt
          ).then((amnt) => {
            assert.equal(amnt.value.amount, offering.amount.toString())
          });
        });
      });
      
    } catch(err) {
      console.log(err);
      assert.fail("Failed to create tokens for _ trade offer");
    }
  });

  it('Creates trade offer to specific address', async () => {
    try {
      const globalState = await getTradeStatePDA(program.programId);
      const escrowNonce = (await program.account.globalTradeState.fetch(globalState)).nextEscrowNonce;
      const escrow = await getTradeEscrowPDA(
        program.programId,
        globalState,
        publicKey,
        escrowNonce,
      );

      const tokenOfferings = [
        {
          amount: new BN(10 * Math.pow(10, 6)),
          mint: new PublicKey("9HtP8WKuGNLBtizDu8BaiFqtdBPiG5G4oWRQeSLknFSr"),
          collection: null,
        }
      ];
      const solAmnt = 0.01 * LAMPORTS_PER_SOL;

      const remainingAccounts = (await Promise.all(tokenOfferings.map(async (offering) => {
        return [
          {
            pubkey: offering.mint,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: await Token.getAssociatedTokenAddress(
              ASSOCIATED_TOKEN_PROGRAM_ID,
              TOKEN_PROGRAM_ID,
              offering.mint,
              publicKey,
              false
            ),
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: await getTradeEscrowTokenPDA(
              program.programId,
              escrow,
              offering.mint
            ),
            isSigner: false,
            isWritable: true,
          }
        ];
      }))).flat();
      const offeree = new PublicKey("HrwuViYPemkfcBw7oA1HbaY75KMVHem2dYcxgDcUaL7a");

      await program.methods
        .createTradeOffer(
          escrowNonce,
          tokenOfferings,
          [],
          new BN(solAmnt),
          null,
          offeree
        )
        .accounts({
          globalState,
          escrowAccount: escrow,
        })
        .remainingAccounts(remainingAccounts)
        .rpc()

      const data = await program.account.tradeEscrow.fetch(escrow);

      assert.equal(data.nonce.toNumber(), escrowNonce.toNumber());
      assert.equal(data.offerer.toString(), publicKey.toString());
      assert.notDeepEqual(data.tokensOffering, []);
      assert.deepEqual(data.tokensRequesting, []);
      assert.equal(data.lamportsOffering.toNumber(), solAmnt);
      assert.equal(data.lamportsRequesting, null);
      assert.equal(data.offeree.toString(), offeree.toString());

      tokenOfferings.forEach((offering) => {
        getTradeEscrowTokenPDA(
          program.programId,
          escrow,
          offering.mint
        ).then((tokAcnt) => {
          provider.connection.getTokenAccountBalance(
            tokAcnt
          ).then((amnt) => {
            assert.equal(amnt.value.amount, offering.amount.toString())
          });
        });
      });
      
    } catch(err) {
      console.log(err);
      assert.fail("Failed to create tokens for _ trade offer");
    }
  });

  it('Withdraws trade offer after creation', async () => {
    try {
      const globalState = await getTradeStatePDA(program.programId);
      const escrowNonce = (await program.account.globalTradeState.fetch(globalState)).nextEscrowNonce;
      const escrow = await getTradeEscrowPDA(
        program.programId,
        globalState,
        publicKey,
        escrowNonce,
      );

      const tokenOfferings = [
        {
          amount: new BN(10 * Math.pow(10, 6)),
          mint: new PublicKey("9HtP8WKuGNLBtizDu8BaiFqtdBPiG5G4oWRQeSLknFSr"),
          collection: null,
        }
      ];
      const solAmnt = 0.01 * LAMPORTS_PER_SOL;

      const remainingAccounts = (await Promise.all(tokenOfferings.map(async (offering) => {
        return [
          {
            pubkey: offering.mint,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: await Token.getAssociatedTokenAddress(
              ASSOCIATED_TOKEN_PROGRAM_ID,
              TOKEN_PROGRAM_ID,
              offering.mint,
              publicKey,
              false
            ),
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: await getTradeEscrowTokenPDA(
              program.programId,
              escrow,
              offering.mint
            ),
            isSigner: false,
            isWritable: true,
          }
        ];
      }))).flat();

      await program.methods
        .createTradeOffer(
          escrowNonce,
          tokenOfferings,
          [],
          new BN(solAmnt),
          null,
          null
        )
        .accounts({
          globalState,
          escrowAccount: escrow,
        })
        .remainingAccounts(remainingAccounts)
        .rpc()

      const tokAcntBals: string[] = [];
      tokenOfferings.forEach((offering) => {
        Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          offering.mint,
          publicKey,
          false
        ).then((address) => {
          provider.connection.getTokenAccountBalance(
            address
          ).then((amnt) => {
            tokAcntBals.push(amnt.value.amount);
          });
        })
      })

      await program.methods
        .withdrawTradeOffer(
          escrowNonce,
        )
        .accounts({
          globalState,
          escrowAccount: escrow,
        })
        .remainingAccounts(remainingAccounts)
        .rpc()

      try {
        await program.account.tradeEscrow.fetch(escrow);
        assert.fail("Should have failed to fetch account data.");
      } catch (err) {
        assert.equal(err.message, `Account does not exist ${escrow.toString()}`)
      }
      
      tokenOfferings.forEach((offering, i) => {
        getTradeEscrowTokenPDA(
          program.programId,
          escrow,
          offering.mint
        ).then((escrowToken) => {
          provider.connection.getParsedAccountInfo(escrowToken).then((escrowTokAcntInfo) => {
            assert.equal(escrowTokAcntInfo.value, null);
          });
        });
        
        Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          offering.mint,
          publicKey,
          false
        ).then((address) => {
          provider.connection.getTokenAccountBalance(
            address
          ).then((amnt) => {
            assert.equal(amnt.value.amount, offering.amount.add(new BN(tokAcntBals[i])).toString());
          });
        });
      });
      
    } catch(err) {
      console.log(err);
      assert.fail("Failed to create tokens for _ trade offer");
    }
  });

  it('Fulfills tokens for sol trade offer', async () => {
    try {
      const globalState = await getTradeStatePDA(program.programId);
      const escrowNonce = (await program.account.globalTradeState.fetch(globalState)).nextEscrowNonce;
      const escrow = await getTradeEscrowPDA(
        program.programId,
        globalState,
        publicKey,
        escrowNonce,
      );

      const tokenOfferings = [
        {
          amount: new BN(10 * Math.pow(10, 6)),
          mint: new PublicKey("9HtP8WKuGNLBtizDu8BaiFqtdBPiG5G4oWRQeSLknFSr"),
          collection: null,
        }
      ];
      const solAmnt = 0.01 * LAMPORTS_PER_SOL;

      const remainingAccounts = (await Promise.all(tokenOfferings.map(async (offering) => {
        return [
          {
            pubkey: offering.mint,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: await Token.getAssociatedTokenAddress(
              ASSOCIATED_TOKEN_PROGRAM_ID,
              TOKEN_PROGRAM_ID,
              offering.mint,
              publicKey,
              false
            ),
            isSigner: false,
            isWritable: true,
          },
          {
            pubkey: await getTradeEscrowTokenPDA(
              program.programId,
              escrow,
              offering.mint
            ),
            isSigner: false,
            isWritable: true,
          }
        ];
      }))).flat();

      await program.methods
        .createTradeOffer(
          escrowNonce,
          tokenOfferings,
          [],
          null,
          new BN(solAmnt),
          null
        )
        .accounts({
          globalState,
          escrowAccount: escrow,
        })
        .remainingAccounts(remainingAccounts)
        .rpc()
      
      const offeree = Keypair.generate();
      let aTx = await provider.connection.requestAirdrop(offeree.publicKey, 0.5 * LAMPORTS_PER_SOL);
      await provider.connection.confirmTransaction(aTx);

      const tokAcntBals: string[] = [];
      tokenOfferings.forEach((offering) => {
        Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          offering.mint,
          offeree.publicKey,
          false
        ).then((address) => {
          provider.connection.getTokenAccountBalance(
            address
          ).then((amnt) => {
            tokAcntBals.push(amnt.value ? amnt.value.amount : '0');
          });
        })
      })

      await program.methods
        .fulfillTradeOffer(
          escrowNonce,
        )
        .accounts({
          globalState,
          escrowAccount: escrow,
          offerer: publicKey,
        })
        .remainingAccounts(remainingAccounts)
        .rpc()

      try {
        await program.account.tradeEscrow.fetch(escrow);
        assert.fail("Should have failed to fetch account data.");
      } catch (err) {
        assert.equal(err.message, `Account does not exist ${escrow.toString()}`)
      }
      
      tokenOfferings.forEach((offering, i) => {
        getTradeEscrowTokenPDA(
          program.programId,
          escrow,
          offering.mint
        ).then((escrowToken) => {
          provider.connection.getParsedAccountInfo(escrowToken).then((escrowTokAcntInfo) => {
            assert.equal(escrowTokAcntInfo.value, null);
          });
        });
        
        Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          offering.mint,
          offeree.publicKey,
          false
        ).then((address) => {
          provider.connection.getTokenAccountBalance(
            address
          ).then((amnt) => {
            assert.equal(amnt.value.amount, offering.amount.add(new BN(tokAcntBals[i])).toString());
          });
        });
      });
      
    } catch(err) {
      console.log(err);
      assert.fail("Failed to create tokens for _ trade offer");
    }
  });

})