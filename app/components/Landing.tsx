import {
  anchorVersionToEnum,
  createAndSendTx,
  getProgram,
  getProvider,
} from '@helpers/mixins';
import { InitilizeMarketplace } from '@instructions/InitializeMarketplace';
import { Wallet } from '@project-serum/anchor';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';
import { FC, useCallback, useEffect, useState } from 'react';
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { RegisterStandardCollection } from '@instructions/RegisterStandardCollection';
import { getCollectionPDA, getMarketplacePDA } from '@helpers/pdas';
import { CandyMachineVersion, CollectionData, TokenType } from '@helpers/types';
import { ASSOCIATED_TOKEN_PROGRAM_ID, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { CreateTokenMetadata } from '@instructions/CreateTokenMetadata';
import { ListToken } from '@instructions/ListToken';
import { DelistToken } from '@instructions/DelistToken';
import { BuyToken } from '@instructions/BuyToken';
import { TEMP_ORG_NAME } from '@helpers/constants';
import { InitilizeMasterVault } from '@instructions/InitializeMasterVault';
import { InitilizeOrganization } from '@instructions/InitializeOrganization';

export const Landing: FC = () => {
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const [provider, setProvider] = useState(getProvider(connection, wallet as Wallet));
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [tokens, setTokens] = useState([]);

  const init = async () => {
    const ixs: TransactionInstruction[] = [];

    ixs.push(
      await InitilizeMasterVault(provider, 250)
    );

    ixs.push(
      await InitilizeOrganization(provider, TEMP_ORG_NAME)
    );

    ixs.push(
      await InitilizeMarketplace(
        provider, 
        TokenType.NonFungible, 
        100, 
        true, 
        TEMP_ORG_NAME
      )
    );

    ixs.push(
      await InitilizeMarketplace(
        provider, 
        TokenType.Fungible, 
        100, 
        true, 
        TEMP_ORG_NAME
      )
    );

    await createAndSendTx(ixs, connection, publicKey as PublicKey, sendTransaction);
  }

  const registerNewCollection = async () => {
    const ixs: TransactionInstruction[] = [];

    ixs.push(
      await RegisterStandardCollection(
        provider,
        new PublicKey('Dfn6BJyWp71hVxVjh28RrejgiFkqix6n7zqn3XwvC9Kc'),
        new PublicKey('G8VFfsD27RgHpMfKNVeuuayc7VCQDiQTKRsdxm3ZMwyA'),
        'Panda Social Club',
        CandyMachineVersion.V2
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

    ixs.push(await CreateTokenMetadata(provider, mint, 'Best You Ever Had', 'BYEH'));

    ixs.push(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint.publicKey,
        tokAcnt,
        publicKey as PublicKey,
        publicKey as PublicKey
      )
    );

    ixs.push(
      Token.createMintToInstruction(
        TOKEN_PROGRAM_ID,
        mint.publicKey,
        tokAcnt,
        publicKey as PublicKey,
        [],
        1000 * Math.pow(10, 6)
      )
    );

    await createAndSendTx(ixs, connection, publicKey as PublicKey, sendTransaction, [
      mint,
    ]);
  };

  const listToken = async () => {
    const ixs: TransactionInstruction[] = [];

    ixs.push(
      await ListToken(
        provider,
        new PublicKey('JLH6X6GUoBj9D3MYqoptAwPZT6yZtSyMHV28aMd2GQj'),
        0.02,
        100,
        TEMP_ORG_NAME
      )
    );

    await createAndSendTx(ixs, connection, publicKey as PublicKey, sendTransaction);
  };

  const delistToken = async () => {
    const ixs: TransactionInstruction[] = [];

    ixs.push(
      await DelistToken(
        provider,
        new PublicKey('JLH6X6GUoBj9D3MYqoptAwPZT6yZtSyMHV28aMd2GQj'),
        TEMP_ORG_NAME
      )
    );

    await createAndSendTx(ixs, connection, publicKey as PublicKey, sendTransaction);
  };

  const buyToken = async () => {
    const ixs: TransactionInstruction[] = [];

    ixs.push(
      await BuyToken(
        provider,
        new PublicKey('JLH6X6GUoBj9D3MYqoptAwPZT6yZtSyMHV28aMd2GQj'),
        new PublicKey('B2B2XZpk2a9hvpNBpXYNdZxg3Sy5WJb34wdoDgb5VFJ8'),
        100,
        TEMP_ORG_NAME
      )
    );

    await createAndSendTx(ixs, connection, publicKey as PublicKey, sendTransaction);
  };

  const tester = async () => {
    console.log(
      (
        await connection.getParsedAccountInfo(
          new PublicKey('37XmTnaRgPWuWzkJG4vgF1g7DiB8SjHWFFDwjLXH46wn')
        )
      ).value
    );
  };

  const getCollections = useCallback(async () => {
    const program = getProgram(provider);
    const cols = await program.account.collection.all();

    return cols.map((col) => {
      return {
        ...(col.account as CollectionData),
        version: anchorVersionToEnum(col.account.version),
      };
    });
  }, [provider]);

  const getTokenListings = useCallback(async () => {
    const program = getProgram(provider);
    const escrows = await program.account.escrow.all();

    const fungiblesMarketplace = getMarketplacePDA(TEMP_ORG_NAME, TokenType.Fungible);
    const fungibleEscrows = escrows.filter((e) => {
      return e.account.marketplace.toString() === fungiblesMarketplace.toString();
    });

    console.log(fungibleEscrows);
  }, [provider]);

  useEffect(() => {
    getCollections().then((cols) => {
      setCollections(cols);
    });
  }, [getCollections]);

  useEffect(() => {
    getTokenListings();
  }, [getTokenListings]);

  useEffect(() => {
    setProvider(getProvider(connection, wallet as Wallet));
  }, [wallet, connection]);

  return (
    <div>
      {publicKey && (
        <div>
          <div className="flex space-x-2">
            <button onClick={init}>Initialize</button>
            <button onClick={registerNewCollection}>New Collection</button>
            <button onClick={tester}>test</button>
          </div>
          <div className="flex space-x-2">
            <button onClick={createToken}>New Token</button>
            <button onClick={listToken}>List Token</button>
            <button onClick={delistToken}>Delist Token</button>
            <button onClick={buyToken}>Buy Token</button>
          </div>
          <div className="mt-4">
            Collections:
            <div>
              {collections.map((col) => {
                return (
                  <a
                    key={col.collectionId.toString()}
                    href={'/collections/' + col.collectionId.toString()}
                    className="hover:underline">
                    {col.name}
                  </a>
                );
              })}
            </div>
          </div>
          <div className="mt-4">
            Tokens:
            <div>
              {tokens.map((tok) => {
                // return (
                // <a
                //   key={tok.collectionId.toString()}
                //   href={'/collections/'+tok.collectionId.toString()}
                //   className="hover:underline"
                // >
                //   {tok.name}
                // </a>
                // )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
