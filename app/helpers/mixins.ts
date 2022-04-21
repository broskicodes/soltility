import { 
  Idl, 
  Program, 
  Provider, 
  setProvider, 
  Wallet 
} from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { 
  Connection, 
  Keypair, 
  PublicKey, 
  Transaction, 
  TransactionInstruction 
} from "@solana/web3.js";
import idl from '../idls/marketplace_aas.json';
import { MARKETPLACE_PROGRAM_ADDRESS } from "./constants";
import { getTradeEscrowTokenPDA } from "./pdas";
import { CandyMachineVersion, TokenOffering, TokenType } from "./types";

export const getProgram = (
  provider?: Provider,
) => {
  const program = new Program(
    idl as Idl, 
    MARKETPLACE_PROGRAM_ADDRESS, 
    provider ? provider : undefined,
  );

  return program;
}

export const getProvider = (
  connection: Connection,
  wallet: Wallet,
) => {
  const opts = Provider.defaultOptions();
  const provider = new Provider(connection, wallet, opts);
  setProvider(provider);

  return provider;
}

export const createAndSendTx = async (
  ixs: TransactionInstruction[],
  connection: Connection,
  user: PublicKey,
  sendTransaction: Function,
  signers?: Keypair[],
) => {
  const tx = new Transaction({
    recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    feePayer: user,
  });
  ixs.forEach(ix => {
    tx.add(ix);
  });

  const sig = await sendTransaction(
    tx, 
    connection, 
    { signers: signers }
  );

  console.log("https://explorer.solana.com/tx/"+sig+"?cluster=devnet");

  return sig;
}

export const anchorVersionToEnum = (versionObj: Object) => {
  switch(Object.keys(versionObj)[0]){
    case 'v1':
      return CandyMachineVersion.V1;
    case 'v2':
      return CandyMachineVersion.V2;
    default:
      return CandyMachineVersion.Other;
  }
}

export const candyMachineVersionToAnchorEnum = (version: CandyMachineVersion) => {
  switch(version){
    case CandyMachineVersion.V1:
      return { 'v1': {} };
    case CandyMachineVersion.V2:
      return { 'v2': {} };
    default:
      throw new Error("Unsupported candy machine version");
  }
}

export const tokenTypeEnumToAnchorEnum = (type: TokenType) => {
  switch(type) {
    case TokenType.Fungible:
      return { 'fungible': {} };
    case TokenType.NonFungible:
      return { 'nonFungible': {} };
    default:
      throw new Error("Unsupported token type");
  }
}

export const anchorTokenTypeToEnum = (versionObj: Object) => {
  switch(Object.keys(versionObj)[0]){
    case 'fungible':
      return TokenType.Fungible;
    case 'nonFungible':
      return TokenType.NonFungible;
    default:
      return TokenType.Other;
  }
}

export const getOfferingRemainingAccounts = async (
  tokensOffering: TokenOffering[],
  user: PublicKey,
  escrow: PublicKey,
) => {
  const remainingAccounts = (await Promise.all(tokensOffering.map(async (offering) => {
    if(!offering.mint){
      throw new Error("Offering requires a mint");
    }

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
          user,
          false
        ),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: await getTradeEscrowTokenPDA(
          escrow,
          offering.mint
        ),
        isSigner: false,
        isWritable: true,
      }
    ];
  }))).flat();

  return remainingAccounts;
}

export const getRequestingRemainingAccounts = async (
  mints: PublicKey[],
  offerer: PublicKey,
  offeree: PublicKey,
) => {
  const remainingAccounts = (await Promise.all(mints.map(async (mint) => {
    return [
      {
        pubkey: mint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: await Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          mint,
          offeree,
          false
        ),
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: await Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          mint,
          offerer,
          false
        ),
        isSigner: false,
        isWritable: true,
      },
    ];
  }))).flat();

  return remainingAccounts;
}