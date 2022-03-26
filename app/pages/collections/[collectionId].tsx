import { CollectionList } from '@components/CollectionList';
import { Landing } from '@components/Landing';
import { Page } from '@components/Page';
import { DEVNET_RPC_ENDPOINT } from '@helpers/constants';
import { getProgram, getProvider } from '@helpers/mixins';
import { getCollectionPDA } from '@helpers/pdas';
import { CollectionData, EscrowAccountData } from '@helpers/types';
import NodeWallet from '@project-serum/anchor/dist/cjs/nodewallet';
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
// import 'dotenv/config';

export const getStaticPaths = async () => {
  const provider = getProvider(
    new Connection(DEVNET_RPC_ENDPOINT),
    new NodeWallet(Keypair.generate())
  );
  const program = getProgram(provider);
  const collections = await program.account.collection.all();

  const paths = collections.map((col) => {
    return {
      params: { collectionId: col.account.collectionId.toString() }
    }
  });

  return {
    paths: paths,
    fallback: false,
  };
}

export const getStaticProps = async (ctx: any) => {
  const collectionId =  new PublicKey(ctx.params.collectionId);
  const collection = await getCollectionPDA(collectionId);
  const provider = getProvider(
    new Connection(DEVNET_RPC_ENDPOINT),
    new NodeWallet(Keypair.generate())
  );
  const program = getProgram(provider);

  const accounts = await program.account.escrow.all();

  const listings = accounts
    .filter((acc) => {
      return acc.account.collection.toString() === collection.toString();
    })
    .map((acc) => {
      return {
        ...acc.account as EscrowAccountData,
        collection: acc.account.collection.toString(),
        seller: acc.account.seller.toString(),
        mint: acc.account.mint.toString(),
        tokenAccount: acc.account.tokenAccount.toString(),
        price: acc.account.price.toNumber() / LAMPORTS_PER_SOL,
      };
    });

  return {
    props: {
      data: listings,
    },
  };
}

interface JSEscrowAccountData {
  active: boolean,
  collection: string,
  seller: string,
  mint: string,
  tokenAccount: string,
  price: number,
}

const CollectionPage: NextPage<{ data: JSEscrowAccountData[] }> = ({ data }) => {
  const router = useRouter();

  const [listings, setListings] = useState<EscrowAccountData[]>();

  useEffect(() => {
    setListings(
      data.map((d) => {
        return {
          ...d,
          collection: new PublicKey(d.collection),
          seller: new PublicKey(d.seller),
          mint: new PublicKey(d.mint),
          tokenAccount: new PublicKey(d.tokenAccount),
        }
      })
    );
    console.log(router.query.collectionId);
  }, []);

  return (
    <Page>
      <CollectionList 
        listings={listings as EscrowAccountData[]} 
        collectionId={new PublicKey(router.query.collectionId as string)}
      />
    </Page>
  );
};

export default CollectionPage;
