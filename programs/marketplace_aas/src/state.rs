use {
  anchor_lang::prelude::*,
};

#[derive(Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub enum CandyMachineVersion {
  V1,
  V2,
}

#[derive(Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub enum TokenType {
  NonFungible,
  Fungible,
}

#[derive(Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub struct TokenOffering {
  pub amount: u64,
  pub mint: Option<Pubkey>,
  pub collection: Option<Pubkey>,
}

#[account]
pub struct MasterVault {
  pub authority: Pubkey,
  // Basis points
  pub fee: u16,
  pub extra_space: [u8; 256],
}

#[account]
pub struct Organization {
  pub authority: Pubkey,
  pub name: String,
  pub custom_vault: Option<Pubkey>,
  pub extra_space: [u8; 256],
}

#[account]
pub struct Marketplace {
  pub token_type: TokenType,
  pub organization: Pubkey,
  pub update_authority: Pubkey,
  // In basis points
  pub fee: u16,
  pub is_mutable: bool,
  pub extra_space: [u8; 256],
}

#[account]
pub struct Collection {
  pub version: CandyMachineVersion,
  pub collection_id: Pubkey,
  pub name: String,
  pub extra_space: [u8; 256],
}

#[account]
pub struct MarketEscrow {
  pub token_type: TokenType,
  pub marketplace: Pubkey,
  pub collection: Option<Pubkey>,
  pub metadata: Option<Pubkey>,
  pub seller: Pubkey,
  pub mint: Pubkey,
  pub token_account: Pubkey,
  pub price_per_token: u64,
  pub extra_space: [u8; 256],
}

#[account]
pub struct GlobalTradeState {
  pub next_escrow_nonce: u64,
  pub completed_trades: u64,
  pub pending_offers: u64,
}

#[account]
pub struct TradeEscrow {
  pub nonce: u64,
  pub offerer: Pubkey,
  pub tokens_offering: Vec<TokenOffering>,
  pub tokens_requesting: Vec<TokenOffering>,
  pub lamports_offering: Option<u64>,
  pub lamports_requesting: Option<u64>,
  pub offeree: Option<Pubkey>,
}

#[account]
pub struct StakeVault {
  pub organization: Pubkey,
  pub collection: Pubkey,
  pub authority: Pubkey,
  pub reward_mint: Pubkey,
  pub min_lock_time: u32,
  pub daily_rate: u8,
}

#[account]
pub struct StakeEscrow {
  pub stake_vault: Pubkey,
  pub user: Pubkey,
  pub nft_mint: Pubkey,
  pub daily_rate: u8,
  pub start_date: i64,
  pub last_claimed_date: i64,
}