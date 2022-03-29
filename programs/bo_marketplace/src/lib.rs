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

declare_id!("9XTHyBBSDBVxnDm8yMv4qNHDYbaEMAmaVBfJoMYJX4ui");

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
    _token_type: TokenType,
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
    token_type: TokenType,
    price: u64,
  ) -> Result<()> {
    process_list_nft::process_list_nft(
      ctx,
      token_type,
      price,
    )
  }

  pub fn delist_nft(
    ctx: Context<DelistNft>,
    _token_type: TokenType,
    escrow_nonce: u8,
  ) -> Result<()> {    
    process_delist_nft::process_delist_nft(
      ctx,
      escrow_nonce,
    )
  }

  pub fn buy_nft<'a, 'b, 'c, 'info>(
    ctx: Context<'a, 'b, 'c, 'info, BuyNft<'info>>,
    _token_type: TokenType,
    escrow_nonce: u8,
    vault_nonce: u8,
  ) -> Result<()> {    
    process_buy_nft::process_buy_nft(
      ctx,
      escrow_nonce,
      vault_nonce,
    )
  }

  pub fn create_token_metadata(
    ctx: Context<CreateTokenMetadata>,
    _token_type: TokenType,
    name: String,
    symbol: String,
  ) -> Result<()> {
    process_create_token_metadata::process_create_token_metadata(
      ctx,
      name,
      symbol,
    )
  }

  pub fn list_token(
    ctx: Context<ListToken>,
    token_type: TokenType,
    price_per_token: u64,
    amount: u64,
  ) -> Result<()> {
    process_list_token::process_list_token(
      ctx,
      token_type,
      price_per_token,
      amount,
    )
  }

  pub fn delist_token(
    ctx: Context<DelistToken>,
    _token_type: TokenType,
    escrow_nonce: u8,
  ) -> Result<()> {    
    process_delist_token::process_delist_token(
      ctx,
      escrow_nonce,
    )
  }

  pub fn buy_token<'a, 'b, 'c, 'info>(
    ctx: Context<'a, 'b, 'c, 'info, BuyToken<'info>>,
    _token_type: TokenType,
    escrow_nonce: u8,
    vault_nonce: u8,
    amount: u64,
  ) -> Result<()> {    
    process_buy_token::process_buy_token(
      ctx,
      escrow_nonce,
      vault_nonce,
      amount,
    )
  }
}



