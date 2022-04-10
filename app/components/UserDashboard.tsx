import { createAndSendTx, getProgram, getProvider } from '@helpers/mixins';
import { Wallet } from '@project-serum/anchor';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { FC, useCallback, useEffect, useState } from 'react';
import { Metadata, Creator } from '@metaplex-foundation/mpl-token-metadata';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { NftData } from '@helpers/types';
import { ListNft } from '@instructions/ListNft';
import { TEMP_ORG_NAME } from '@helpers/constants';
import { ListToken } from '@instructions/ListToken';

export const UserDashboard: FC = () => {
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const [provider, setProvider] = useState(getProvider(connection, wallet as Wallet));
  const [userNfts, setUserNfts] = useState<Map<string, { nfts: NftData[], name: string }>>(new Map());

  const loadNfts = useCallback(async () => {
    const data = await Metadata.findDataByOwner(connection, publicKey as PublicKey);

    // console.log(nfts);
    const nfts = await Promise.all(
      data.map(async (d) => {
        const res = await fetch(d.data.uri);
        const metadata = await res.json();
        const imgRes = await fetch(metadata.image);
        const imgBlob = await imgRes.blob();

        return {
          mint: new PublicKey(d.mint),
          collectionId: d.collection
            ? new PublicKey(d.collection.key)
            : new PublicKey((d.data.creators as Creator[])[0].address),
          metadata: metadata,
          imageSrc: URL.createObjectURL(imgBlob),
        };
      })
    );

    const nftMap = new Map<string, { nfts: NftData[], name: string }>();
    const program = getProgram(provider);
    const collections = await program.account.collection.all();

    collections.forEach((col) => {
      nftMap.set(
        col.account.collectionId.toString() as string,
        {
          nfts: [],
          name: col.account.name as string,
        },
      );
    });

    // console.log(nfts)

    nfts.forEach((nft) => {
      if(!nftMap.has(nft.collectionId.toString())){
        return;
      }

      nftMap.get(nft.collectionId.toString())?.nfts.push(
        nft,
      );
    });

    return nftMap;
  }, [connection, publicKey]);

  const listNft = async (nft: NftData) => {
    const ixs: TransactionInstruction[] = [];

    ixs.push(await ListNft(provider, nft, 1, TEMP_ORG_NAME));

    try {
      await createAndSendTx(ixs, connection, publicKey as PublicKey, sendTransaction);
    } catch (e) {
      console.log(e);
    }
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

  useEffect(() => {
    if (publicKey) {
      loadNfts().then((nfts) => {
        setUserNfts(nfts);
        console.log(nfts)
      });
    }
  }, [publicKey, loadNfts]);

  useEffect(() => {
    setProvider(getProvider(connection, wallet as Wallet));
  }, [wallet, connection]);

  return (
    <div className="mt-4">
      {publicKey && (
        <div>
          {Array.from(userNfts.values()).map((collection) => {
            if(collection.nfts.length > 0){
              return (
                <div key={collection.name}>
                  <div>
                    {collection.name}
                  </div>
                  <div className="grid grid-cols-5 gap-y-4">
                    {collection.nfts.map((nft) => {
                      return (
                        <div key={nft.mint.toString()} className="w-24">
                          <button
                            className="rounded-lg overflow-hidden"
                            onClick={() => {
                              listNft(nft);
                            }}>
                            <img src={nft.imageSrc} width="100%" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
      
      <button onClick={listToken}>List Token</button>

    </div>
  );
};
