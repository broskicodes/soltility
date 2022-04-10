import {
  anchorTokenTypeToEnum,
  anchorVersionToEnum,
  createAndSendTx,
  getProgram,
  getProvider,
} from '@helpers/mixins';
import { Wallet } from '@project-serum/anchor';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js';
import { FC, useCallback, useEffect, useState } from 'react';
import { getCollectionPDA, getMarketplacePDA } from '@helpers/pdas';
import { 
  CandyMachineVersion, 
  CollectionData, 
  TokenType,
  EscrowAccountData,
} from '@helpers/types';
import { ListToken } from '@instructions/ListToken';
import { DelistToken } from '@instructions/DelistToken';
import { BuyToken } from '@instructions/BuyToken';
import { TEMP_ORG_NAME } from '@helpers/constants';

export const Landing: FC = () => {
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const [provider, setProvider] = useState(getProvider(connection, wallet as Wallet));
  const [collections, setCollections] = useState<CollectionData[]>([]);
  const [tokens, setTokens] = useState<Map<string, EscrowAccountData[]>>(new Map());

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

  // const tester = async () => {
  //   console.log(
  //     (
  //       await connection.getParsedAccountInfo(
  //         new PublicKey('37XmTnaRgPWuWzkJG4vgF1g7DiB8SjHWFFDwjLXH46wn')
  //       )
  //     ).value
  //   );
  // };

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

    // const fungiblesMarketplace = await getMarketplacePDA(TEMP_ORG_NAME, TokenType.Fungible);
    const fungibleEscrows = escrows.filter((e) => {
      return anchorTokenTypeToEnum(e.account.tokenType) === TokenType.Fungible;
    });

    const listings: Map<string, EscrowAccountData[]> = new Map();

    fungibleEscrows.forEach((e) => {
      const mintKey: string = e.account.mint.toString();

      if(!listings.has(mintKey)){
        listings.set(mintKey, []);
      }

      listings.get(mintKey)?.push(
        {
          ...e.account as EscrowAccountData,
          tokenType: anchorTokenTypeToEnum(e.account.tokenType),
          pricePerToken: e.account.pricePerToken / LAMPORTS_PER_SOL,
        }
      );
    });

    // console.log(listings);
    return listings;
  }, [provider]);

  useEffect(() => {
    getCollections().then((cols) => {
      setCollections(cols);
    });
  }, [getCollections]);

  useEffect(() => {
    getTokenListings().then((listings) => {
      setTokens(listings);
    });
  }, [getTokenListings]);

  useEffect(() => {
    setProvider(getProvider(connection, wallet as Wallet));
  }, [wallet, connection]);

  return (
    <div>
      {publicKey && (
        <div>
          <div className="flex space-x-2">
            {/* <button onClick={tester}>test</button> */}
          </div>
          <div className="flex space-x-2">
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
              {Array.from(tokens.keys()).map((mint) => {
                return (
                  <button 
                    key={mint}
                    className="hover:underline"
                    >
                    {mint}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
