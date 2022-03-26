import { 
  Idl, 
  Program, 
  Provider, 
  setProvider, 
  Wallet 
} from "@project-serum/anchor";
import { 
  Connection, 
  PublicKey, 
  Transaction, 
  TransactionInstruction 
} from "@solana/web3.js";
import idl from '../idls/bo_marketplace.json';
import { MARKETPLACE_PROGRAM_ADDRESS } from "./constants";
import { CandyMachineVersion } from "./types";

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
) => {
  const tx = new Transaction({
    recentBlockhash: (await connection.getLatestBlockhash()).blockhash,
    feePayer: user,
  });
  ixs.forEach(ix => {
    tx.add(ix);
  });

  const sig = await sendTransaction(tx, connection);

  console.log(sig);

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