import { TEMP_ORG_NAME } from "@helpers/constants";
import { createAndSendTx, getProvider } from "@helpers/mixins";
import { TokenType } from "@helpers/types";
import { InitilizeMarketplace } from "@instructions/InitializeMarketplace";
import { InitilizeMasterVault } from "@instructions/InitializeMasterVault";
import { InitilizeOrganization } from "@instructions/InitializeOrganization";
import { Wallet } from "@project-serum/anchor";
import { useAnchorWallet, useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { FC, useState } from "react";

export const Admin: FC = () => {
  const { connection } = useConnection();
  const { sendTransaction, publicKey } = useWallet();
  const wallet = useAnchorWallet();
  const [provider, setProvider] = useState(getProvider(connection, wallet as Wallet));

  const init = async () => {
    const ixs: TransactionInstruction[] = [];

    ixs.concat(
      [
        await InitilizeMasterVault(provider, 250),
        await InitilizeOrganization(provider, TEMP_ORG_NAME),
        await InitilizeMarketplace(
          provider, 
          TokenType.NonFungible, 
          100, 
          true, 
          TEMP_ORG_NAME
        ),
        await InitilizeMarketplace(
          provider, 
          TokenType.Fungible, 
          100, 
          true, 
          TEMP_ORG_NAME
        ),
      ]
    )

    await createAndSendTx(ixs, connection, publicKey as PublicKey, sendTransaction);
  }

  return (
    <div className="flex justify-center items-center h-screen">
      <button 
        onClick={init}
        className="text-2xl font-bold bg-blue-400 rounded-lg p-3 text-white"
        >
        Initialize
      </button>
    </div>
  );
};
