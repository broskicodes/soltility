import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { MarketplaceAas } from "../target/types/marketplace_aas";
import { Provider, BN } from "@project-serum/anchor";

describe("Trading unit test", () => {
  const provider = anchor.Provider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.MarketplaceAas as Program<MarketplaceAas>;

  // it('')
})