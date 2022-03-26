pub mod context;
pub mod processor;
pub mod error;
pub mod state;

use {
  anchor_lang::prelude::*,
  crate::context::*,
  crate::processor::*,
  crate::state::*,
  solana_program::entrypoint::ProgramResult,
};

declare_id!("A6mhgyneRNJEgP83JdbMcwb3FSKgwQoYHwXSVrJzg866");

#[program]
pub mod bo_marketplace {
  use super::*;

  pub fn initialize_marketplace(ctx: Context<InitializeMarketplace>) -> ProgramResult {
    process_initialize_marketplace::process_initialize_marketplace(ctx)
  }

  pub fn register_standard_collection(
    ctx: Context<RegisterStandardCollection>,
    version: CandyMachineVersion,
    name: String,
    size: u32,
    hash_list_link: Option<String>,
  ) -> ProgramResult {
    process_register_standard_collection::process_register_standard_collection(
      ctx,
      version,
      name,
      size,
      hash_list_link,
    )
  }
  
  pub fn list_nft(
    ctx: Context<ListNft>,
    price: u64,
  ) -> ProgramResult {
    process_list_nft::process_list_nft(
      ctx,
      price,
    )
  }

  pub fn delist_nft(
    ctx: Context<DelistNft>,
    escrow_nonce: u8,
  ) -> ProgramResult {    
    process_delist_nft::process_delist_nft(
      ctx,
      escrow_nonce,
    )
  }
}



