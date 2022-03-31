import { getProgram, tokenTypeEnumToAnchorEnum } from "@helpers/mixins";
import { Provider, BN } from "@project-serum/anchor";
import { Metadata } from '@metaplex-foundation/mpl-token-metadata';
import { Keypair, PublicKey } from "@solana/web3.js";
import { TOKEN_METADATA_PROGRAM_ADDRESS } from "@helpers/constants";

export const CreateTokenMetadata = async (
  provider: Provider,
  mint: Keypair,
  name: string,
  symbol: string,
) => {
  const program = getProgram(provider);
  const { publicKey } = provider.wallet;

  const metadata = await Metadata.getPDA(mint.publicKey);

  const ix = await program.methods
    .createTokenMetadata(
      name,
      symbol
    )
    .accounts({
      mint: mint.publicKey,
      metadataAccount: metadata,
      mintAuthority: publicKey,
      updateAuthority: publicKey,
      tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ADDRESS,
    })
    .signers([mint])
    .instruction();

  return ix;
}