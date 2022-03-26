import { anchorVersionToEnum, createAndSendTx, getProgram, getProvider } from "@helpers/mixins";
import { InitilizeMarketplace } from "@instructions/InitializeMarketplace";
import { Wallet } from "@project-serum/anchor";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { FC, useCallback, useEffect, useState } from "react";
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { RegisterStandardCollection } from "@instructions/RegisterStandardCollection";
import { getCollectionPDA } from "@helpers/pdas";
import { CollectionData } from "@helpers/types";

export const Landing: FC = () => {
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const [provider, setProvider] = useState(getProvider(connection, wallet as Wallet));
  const [collections, setCollections] = useState<CollectionData[]>([])
  
  // const initMarketplace = async () => {
  //   const ixs: TransactionInstruction[] = [];

  //   ixs.push(await InitilizeMarketplace(provider));

  //   await createAndSendTx(
  //     ixs, 
  //     connection, 
  //     publicKey as PublicKey, 
  //     sendTransaction
  //   );
  // }
  
  const registerNewCollection = async () => {
    const ixs: TransactionInstruction[] = [];

    ixs.push(await RegisterStandardCollection(
      provider,
      new PublicKey("Dfn6BJyWp71hVxVjh28RrejgiFkqix6n7zqn3XwvC9Kc"),
      "Panda Social Club",
      10,
      "https://arweave.net/4YDdoC2y-gpCpYk58UT89-TQFmM8Tbz8sZJY35MhY90",
    ));

    await createAndSendTx(
      ixs, 
      connection, 
      publicKey as PublicKey, 
      sendTransaction
    );
  }

  const tester = async () => {
    const mtdtAcnt = await Metadata.getPDA(new PublicKey("G8VFfsD27RgHpMfKNVeuuayc7VCQDiQTKRsdxm3ZMwyA"));
    const metadata = await Metadata.load(connection, mtdtAcnt);

    console.log(metadata);

    const program = getProgram(provider);
    const collection = await program.account.collection.fetch(await getCollectionPDA(new PublicKey("Dfn6BJyWp71hVxVjh28RrejgiFkqix6n7zqn3XwvC9Kc")));

    console.log(collection);
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

  return (
    <div>
      {publicKey && 
        <div>
          <div className="flex space-x-2">
            {/* <button onClick={initMarketplace}>Init Market</button> */}
            <button onClick={registerNewCollection}>New Collection</button>
            {/* <button onClick={tester}>test</button> */}
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
