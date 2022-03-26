import { createAndSendTx, getProvider } from "@helpers/mixins";
import { EscrowAccountData } from "@helpers/types";
import { DelistNft } from "@instructions/DelistNft";
import { Wallet } from "@project-serum/anchor";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { FC, useEffect } from "react";

interface CollectionListProps {
  listings: EscrowAccountData[],
  collectionId: PublicKey
}
export const CollectionList: FC<CollectionListProps> = ({ listings, collectionId }) => {
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const provider = getProvider(connection, wallet as Wallet);

  const delist = async (mint: PublicKey) => {
    // console.log((await connection.getTokenLargestAccounts(mint)).value[0].address.toString())
    const ixs: TransactionInstruction[] = [];

    ixs.push(await DelistNft(
      provider,
      mint,
      collectionId,
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


  return (
    <div>
      {listings && 
        <div>
          {listings.map((l) => {
            return (
              <button 
                key={l.mint.toString()} 
                onClick={() => { delist(l.mint) }}
                className="hover:underline"
              >
                {l.mint.toString()}
              </button>
            );
          })}
        </div>
      }
    </div>
  );
};
