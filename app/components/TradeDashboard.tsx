import { FC, useState } from "react";
import { getHashedName, getNameAccountKey, getNameOwner, NameRegistryState } from "@bonfida/spl-name-service";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getProvider } from "@helpers/mixins";
import { Wallet } from "@project-serum/anchor";
import { MAINNET_RPC_ENDPOINT, SOL_TLD_AUTHORITY } from "@helpers/constants";
import { Connection } from "@solana/web3.js";

export const TradeDashboard: FC = () => {
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const [provider, setProvider] = useState(getProvider(connection, wallet as Wallet));

  const test = async () => {
    // console.log("l");
    const { registry, nftOwner } = await getNameOwner(
      new Connection(MAINNET_RPC_ENDPOINT),
      await getNameAccountKey(
        await getHashedName("nibbus"),
        undefined,
        SOL_TLD_AUTHORITY,
      ),
    );

    console.log(registry.owner.toString());
  }

  return (
    <div>
      <button onClick={test}>test</button>
    </div>
  );
};
