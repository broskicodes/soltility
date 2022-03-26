import { createAndSendTx, getProvider } from "@helpers/mixins";
import { Wallet } from "@project-serum/anchor";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { FC, useCallback, useEffect, useState } from "react";
import { Metadata, Creator } from '@metaplex-foundation/mpl-token-metadata'
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { NftData } from "@helpers/types";
import { ListNft } from "@instructions/ListNft";

export const UserDashboard: FC = () => {
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const provider = getProvider(connection, wallet as Wallet);
  const [userNfts, setUserNfts] = useState<NftData[]>([]);

  const loadNfts = useCallback(async () => {
    const nfts = await Metadata.findDataByOwner(connection, publicKey as PublicKey);

    // console.log(nfts);
    return await Promise.all(nfts.map(async (nft) => {
      const res = await fetch(nft.data.uri);
      const metadata = await res.json();
      const imgRes = await fetch(metadata.image);
      const imgBlob = await imgRes.blob();

      return {
        mint: new PublicKey(nft.mint),
        collectionId: nft.collection 
          ? new PublicKey(nft.collection.key) 
          : new PublicKey((nft.data.creators as Creator[])[0].address),
        metadata: metadata,
        imageSrc: URL.createObjectURL(imgBlob),
      }
    }));
  }, [connection, publicKey]);

  const listNft = async (nft: NftData) => {
    const ixs: TransactionInstruction[] = [];

    ixs.push(await ListNft(
      provider,
      nft,
      1
    ));

    try {
      await createAndSendTx(
        ixs, 
        connection, 
        publicKey as PublicKey, 
        sendTransaction
      );
    } catch(e) {
      console.log(e);
    }
  }

  useEffect(() => {
    if(publicKey){
      loadNfts().then((nfts) => {
        setUserNfts(nfts);
      });
    }
  }, [publicKey, loadNfts]);

  return (
    <div className="mt-4">
      {publicKey && 
        <div className="grid grid-cols-5 gap-y-4">
          {userNfts.map((nft) => {
            return (
              <div key={nft.mint.toString()} className="w-24">
                <button className="rounded-lg overflow-hidden" onClick={() => { listNft(nft) }}>
                  <img src={nft.imageSrc} width="100%" />
                </button>
              </div>
            );
          })}
        </div>
      }
    </div>
  );
};
