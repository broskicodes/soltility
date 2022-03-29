import { anchorVersionToEnum, createAndSendTx, getProgram, getProvider } from "@helpers/mixins";
import { InitilizeMarketplace } from "@instructions/InitializeMarketplace";
import { Wallet } from "@project-serum/anchor";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { FC, useCallback, useEffect, useState } from "react";
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { RegisterStandardCollection } from "@instructions/RegisterStandardCollection";
import { getCollectionPDA } from "@helpers/pdas";
import { CandyMachineVersion, CollectionData, TokenType } from "@helpers/types";

export const Landing: FC = () => {
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const [provider, setProvider] = useState(getProvider(connection, wallet as Wallet));
  const [collections, setCollections] = useState<CollectionData[]>([])
  
  const initMarketplaces = async () => {
    const ixs: TransactionInstruction[] = [];

    ixs.push(await InitilizeMarketplace(
      provider,
      TokenType.Nonfungible,
      1,
      true,
    ));

    ixs.push(await InitilizeMarketplace(
      provider,
      TokenType.Fungible,
      1,
      true,
    ));

    await createAndSendTx(
      ixs, 
      connection, 
      publicKey as PublicKey, 
      sendTransaction
    );
  }
  
  const registerNewCollection = async () => {
    const ixs: TransactionInstruction[] = [];

    ixs.push(await RegisterStandardCollection(
      provider,
      new PublicKey("Dfn6BJyWp71hVxVjh28RrejgiFkqix6n7zqn3XwvC9Kc"),
      new PublicKey("G8VFfsD27RgHpMfKNVeuuayc7VCQDiQTKRsdxm3ZMwyA"),
      "Panda Social Club",
      CandyMachineVersion.V2,
    ));

    await createAndSendTx(
      ixs, 
      connection, 
      publicKey as PublicKey, 
      sendTransaction
    );
  }

  const tester = async () => {
    // const mtdtAcnt = await Metadata.getPDA(new PublicKey("G8VFfsD27RgHpMfKNVeuuayc7VCQDiQTKRsdxm3ZMwyA"));
    // const metadata = await Metadata.load(connection, mtdtAcnt);

    // console.log(metadata);

    // const program = getProgram(provider);
    // const collection = await program.account.collection.fetch(await getCollectionPDA(new PublicKey("Dfn6BJyWp71hVxVjh28RrejgiFkqix6n7zqn3XwvC9Kc")));

    // console.log(collection);

    console.log((await connection.getParsedAccountInfo(publicKey as PublicKey)).value?.owner.toString());
  }

  const getCollections = useCallback(async () => {
    const program = getProgram(provider);
    const cols = await program.account.collection.all();

    return cols.map((col) => {
      return {
        ...col.account as CollectionData,
        version: anchorVersionToEnum(col.account.version),
      }
    });
  }, [provider]);

  useEffect(() => {
    getCollections().then((cols) => {
      setCollections(cols);
    });
  }, [getCollections]);

  useEffect(() => {
    setProvider(getProvider(connection, wallet as Wallet))
  }, [wallet, connection]);

  return (
    <div>
      {publicKey && 
        <div>
          <div className="flex space-x-2">
            {/* <button onClick={initMarketplaces}>Init Markets</button> */}
            <button onClick={registerNewCollection}>New Collection</button>
            <button onClick={tester}>test</button>
          </div>
          <div className="mt-4">
            Collections:
            <div>
              {collections.map((col) => {
                return (
                  <a 
                    key={col.collectionId.toString()} 
                    href={'/collections/'+col.collectionId.toString()}
                    className="hover:underline"
                  >
                    {col.name}
                  </a>
                )
              })}
            </div>
          </div>
        </div>
      }
    </div>
  );
};
