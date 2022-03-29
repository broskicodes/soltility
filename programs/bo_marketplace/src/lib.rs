pub mod context;
pub mod processor;
pub mod error;
pub mod state;

use {
  anchor_lang::prelude::*,
  crate::context::*,
  crate::processor::*,
  crate::state::*,
};

declare_id!("A6mhgyneRNJEgP83JdbMcwb3FSKgwQoYHwXSVrJzg866");

#[program]
pub mod bo_marketplace {
  use super::*;

  pub fn initialize_marketplace(
    ctx: Context<InitializeMarketplace>,
    token_type: TokenType,
    fee: u8,
    is_mutable: bool,
  ) -> Result<()> {
    process_initialize_marketplace::process_initialize_marketplace(
      ctx,
      token_type,
      fee,
      is_mutable,
    )
  }

  pub fn register_standard_collection(
    ctx: Context<RegisterStandardCollection>,
    version: CandyMachineVersion,
    name: String,
  ) -> Result<()> {
    process_register_standard_collection::process_register_standard_collection(
      ctx,
      version,
      name,
    )
  }
  
  pub fn list_nft(
    ctx: Context<ListNft>,
    price: u64,
  ) -> Result<()> {
    process_list_nft::process_list_nft(
      ctx,
      price,
    )
  }

  pub fn delist_nft(
    ctx: Context<DelistNft>,
    escrow_nonce: u8,
  ) -> Result<()> {    
    process_delist_nft::process_delist_nft(
      ctx,
      escrow_nonce,
    )
  }

  pub fn buy_nft<'a, 'b, 'c, 'info>(
    ctx: Context<'a, 'b, 'c, 'info, BuyNft<'info>>,
    escrow_nonce: u8,
    vault_nonce: u8,
  ) -> Result<()> {    
    process_buy_nft::process_buy_nft(
      ctx,
      escrow_nonce,
      vault_nonce,
    )
  }
}



