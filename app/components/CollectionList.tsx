import { TEMP_ORG_NAME } from '@helpers/constants';
import { createAndSendTx, getProvider } from '@helpers/mixins';
import { EscrowAccountData } from '@helpers/types';
import { BuyNft } from '@instructions/marketplace/BuyNft';
import { DelistNft } from '@instructions/marketplace/DelistNft';
import { Wallet } from '@project-serum/anchor';
import { useAnchorWallet, useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { FC, useEffect, useState } from 'react';

interface CollectionListProps {
  listings: EscrowAccountData[];
  collectionId: PublicKey;
}
export const CollectionList: FC<CollectionListProps> = ({ listings, collectionId }) => {
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const [provider, setProvider] = useState(getProvider(connection, wallet as Wallet));

  const delist = async (mint: PublicKey) => {
    // console.log((await connection.getTokenLargestAccounts(mint)).value[0].address.toString())
    const ixs: TransactionInstruction[] = [];

    ixs.push(await DelistNft(provider, mint, collectionId, TEMP_ORG_NAME));

    try {
      await createAndSendTx(ixs, connection, publicKey as PublicKey, sendTransaction);
    } catch (e) {
      console.log(e);
    }
  };

  const buy = async (mint: PublicKey, seller: PublicKey) => {
    console.log(mint.toString());
    const ixs: TransactionInstruction[] = [];

    ixs.push(await BuyNft(provider, mint, collectionId, seller, TEMP_ORG_NAME));

    try {
      await createAndSendTx(ixs, connection, publicKey as PublicKey, sendTransaction);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    setProvider(getProvider(connection, wallet as Wallet));
  }, [wallet, connection]);

  return (
    <div>
      {listings && (
        <div>
          {listings.map((l) => {
            return (
              <button
                key={l.mint.toString()}
                onClick={() => {
                  l.seller.toString() === publicKey?.toString()
                    ? delist(l.mint)
                    : buy(l.mint, l.seller);
                }}
                className="hover:underline">
                {l.mint.toString()}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
