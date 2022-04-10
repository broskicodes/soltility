import { createAndSendTx, getProvider } from "@helpers/mixins";
import { CandyMachineVersion } from "@helpers/types";
import { CreateTokenMetadata } from "@instructions/CreateTokenMetadata";
import { RegisterStandardCollection } from "@instructions/RegisterStandardCollection";
import { Wallet } from "@project-serum/anchor";
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { FC, useState } from "react";
import { Metadata, Creator } from '@metaplex-foundation/mpl-token-metadata';
import { Modal } from "./Modal";

export const Creation: FC = () => {
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const [provider, setProvider] = useState(getProvider(connection, wallet as Wallet));
  const [colName, setColName] = useState("");
  const [mintB58, setMintB58] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [cmVersion, setCMVersion] = useState(CandyMachineVersion.V2);

  const registerNewCollection = async () => {
    const ixs: TransactionInstruction[] = [];

    const mint = new PublicKey(mintB58);
    const metadata = await Metadata.load(
      connection,
      await Metadata.getPDA(mint),
    );
    let collectionId;

    switch(cmVersion) {
      case CandyMachineVersion.V1: {
        collectionId = new PublicKey((metadata.data.data.creators as Creator[])[0].address);
        break;
      }
      case CandyMachineVersion.V2: {
        collectionId = new PublicKey(metadata.data.collection?.key as string);
        break;
      }
      default: {
        return new Error("Unsupported candy machine version");
      }
    }

    ixs.push(
      await RegisterStandardCollection(
        provider,
        collectionId,
        mint,
        colName,
        cmVersion
      )
    );

    await createAndSendTx(ixs, connection, publicKey as PublicKey, sendTransaction);
  };

  const createToken = async () => {
    const ixs: TransactionInstruction[] = [];
    const mint = Keypair.generate();
    const tokAcnt = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mint.publicKey,
      publicKey as PublicKey
    );

    ixs.concat(
      [
        await CreateTokenMetadata(
          provider,
          mint, 
          tokenName, 
          tokenSymbol
        ),
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          mint.publicKey,
          tokAcnt,
          publicKey as PublicKey,
          publicKey as PublicKey
        ),
        Token.createMintToInstruction(
          TOKEN_PROGRAM_ID,
          mint.publicKey,
          tokAcnt,
          publicKey as PublicKey,
          [],
          1000 * Math.pow(10, 6)
        ),
      ]
    );

    await createAndSendTx(
      ixs, 
      connection, 
      publicKey as PublicKey, 
      sendTransaction, 
      [mint],
    );
  };

  return (
    <div className="flex flex-col space-y-8">
      {/* <Modal /> */}
      <div>
        <div>Register New Collection</div>
        <div>
          <input
            type="text" 
            placeholder="Collection Name" 
            value={colName} 
            onChange={({ target }) => {
              setColName(target.value);
            }} 
          />
          <input
            type="text" 
            placeholder="Token Mint of Collection" 
            value={mintB58} 
            onChange={({ target }) => {
              setMintB58(target.value);
            }} 
          />
          <div 
            className="flex flex-col"
            onChange={({ target }) => {
              setCMVersion(Number((target as HTMLInputElement).value));
            }}
          >
            <div>
              <input
                id="v1"
                type="radio"
                name="version"
                checked={cmVersion === CandyMachineVersion.V1}
                value={CandyMachineVersion.V1}
              />
              <label htmlFor="v1">CM Version 1</label>
            </div>
            <div>
              <input
                id="v2"
                type="radio"
                name="version"
                checked={cmVersion === CandyMachineVersion.V2}
                value={CandyMachineVersion.V2}
              />
              <label htmlFor="v2">CM Version 2</label>
            </div>
          </div>
        </div>
        <button onClick={registerNewCollection}>Register</button>
      </div>
      <div className="flex, flex-col">
        <div>Create and Mint New Token</div>
        <div>
          <input
            type="text" 
            placeholder="Token Name" 
            value={tokenName} 
            onChange={({ target }) => {
              setTokenName(target.value);
            }} 
          />
          <input
            type="text" 
            placeholder="Token Symbol" 
            value={tokenSymbol} 
            onChange={({ target }) => {
              setTokenSymbol(target.value);
            }} 
          />
        </div>
        <button onClick={createToken}>Create</button>
      </div>
    </div>
  );
};
