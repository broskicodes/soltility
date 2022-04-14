pub mod context;
pub mod processor;
pub mod error;
pub mod state;
pub mod utils;

use {
  anchor_lang::prelude::*,
  crate::context::{
    marketplace_context::*,
    trading_context::*,
    staking_context::*,
    *,
  },
  crate::processor::{
    marketplace_ixs::*,
    trading_ixs::*,
    staking_ixs::*,
    *,
  },
  crate::state::*,
};

declare_id!("22YCvsiJSir1Hb7ihcTvGGXg9uA84AfYjN6vsqphkuEx");

#[program]
pub mod marketplace_aas {
  use super::*;

  pub fn initialize_master_vault(
    ctx: Context<InitializeMasterVault>,
    fee: u16,
  ) -> Result<()> {
    process_initialize_master_vault::process(
      ctx,
      fee,
    )
  }

  pub fn initialize_organization(
    ctx: Context<InitializeOrganization>,
    org_name: String,
    custom_vault: Option<Pubkey>,
  ) -> Result<()> {
    process_initialize_organization::process(
      ctx,
      org_name,
      custom_vault,
    )
  }

  pub fn initialize_marketplace(
    ctx: Context<InitializeMarketplace>,
    _org_name: String,
    token_type: TokenType,
    fee: u16,
    is_mutable: bool,
  ) -> Result<()> {
    process_initialize_marketplace::process(
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
    process_register_standard_collection::process(
      ctx,
      version,
      name,
    )
  }
  
  pub fn list_nft(
    ctx: Context<ListNft>,
    _org_name: String,
    token_type: TokenType,
    price: u64,
  ) -> Result<()> {
    process_list_nft::process(
      ctx,
      token_type,
      price,
    )
  }

  pub fn delist_nft(
    ctx: Context<DelistNft>,
    _org_name: String,
    _token_type: TokenType,
  ) -> Result<()> {    
    process_delist_nft::process(
      ctx,
    )
  }

  pub fn buy_nft<'a, 'b, 'c, 'info>(
    ctx: Context<'a, 'b, 'c, 'info, BuyNft<'info>>,
    _org_name: String,
    _token_type: TokenType,
  ) -> Result<()> {    
    process_buy_nft::process(
      ctx,
    )
  }

  pub fn create_token_metadata(
    ctx: Context<CreateTokenMetadata>,
    name: String,
    symbol: String,
  ) -> Result<()> {
    process_create_token_metadata::process(
      ctx,
      name,
      symbol,
    )
  }

  pub fn list_token(
    ctx: Context<ListToken>,
    _org_name: String,
    token_type: TokenType,
    price_per_token: u64,
    amount: u64,
  ) -> Result<()> {
    process_list_token::process(
      ctx,
      token_type,
      price_per_token,
      amount,
    )
  }

  pub fn delist_token(
    ctx: Context<DelistToken>,
    _org_name: String,
    _token_type: TokenType,
  ) -> Result<()> {    
    process_delist_token::process(
      ctx,
    )
  }

  pub fn buy_token<'a, 'b, 'c, 'info>(
    ctx: Context<'a, 'b, 'c, 'info, BuyToken<'info>>,
    _org_name: String,
    _token_type: TokenType,
    amount: u64,
  ) -> Result<()> {    
    process_buy_token::process(
      ctx,
      amount,
    )
  }

  pub fn initialize_global_trade_state(
    ctx: Context<InitializeGlobalTradeState>,
  ) -> Result<()> {
    process_initialize_global_trade_state::process(
      ctx,
    )
  }

  pub fn create_trade_offer<'a, 'b, 'c, 'info>(
    ctx: Context<'a, 'b, 'c, 'info, CreateTradeOffer<'info>>,
    escrow_nonce: u64,
    tokens_offering: Vec<TokenOffering>,
    tokens_requesting: Vec<TokenOffering>,
    lamports_offering: Option<u64>,
    lamports_requesting: Option<u64>,
    offeree: Option<Pubkey>,
  ) -> Result<()> {
    process_create_trade_offer::process(
      ctx,
      escrow_nonce,
      tokens_offering,
      tokens_requesting,
      lamports_offering,
      lamports_requesting,
      offeree,
    )
  }

  pub fn withdraw_trade_offer<'a, 'b, 'c, 'info>(
    ctx: Context<'a, 'b, 'c, 'info, WithdrawTradeOffer<'info>>,
    _escrow_nonce: u64,
  ) -> Result<()> {
    process_withdraw_trade_offer::process(
      ctx,
    )
  }

  pub fn fulfill_trade_offer<'a, 'b, 'c, 'info>(
    ctx: Context<'a, 'b, 'c, 'info, FulfillTradeOffer<'info>>,
    _escrow_nonce: u64,
  ) -> Result<()> {
    process_fulfill_trade_offer::process(
      ctx,
    )
  }

  pub fn initialize_staking_vault(
    ctx: Context<InitializeStakingVault>,
    _org_name: String,
    min_lock_time: u32,
    daily_rate: u8,
  ) -> Result<()> {
    process_initialize_staking_vault::process(
      ctx,
      min_lock_time,
      daily_rate,
    )
  }

  pub fn stake_nft(
    ctx: Context<StakeNft>,
    _org_name: String,
  ) -> Result<()> {
    process_stake_nft::process(
      ctx,
    )
  }

  pub fn collect_earned_tokens(
    ctx: Context<CollectEarnedTokens>,
    _org_name: String,
  ) -> Result<()> {
    process_collect_earned_tokens::process(
      ctx,
    )
  }

  pub fn unstake_nft(
    ctx: Context<UnstakeNft>,
    _org_name: String,
  ) -> Result<()> {
    process_unstake_nft::process(
      ctx,
    )
  }
}
