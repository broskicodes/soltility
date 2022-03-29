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

#[account]
pub struct Marketplace {
  pub token_type: TokenType,
  pub update_authority: Pubkey,
  // In percentage
  pub fee: u8,
  pub is_mutable: bool,
}

#[account]
pub struct Collection {
  pub version: CandyMachineVersion,
  pub collection_id: Pubkey,
  pub name: String,
}

#[account]
pub struct Escrow {
  pub token_type: TokenType,
  pub marketplace: Pubkey,
  pub collection: Option<Pubkey>,
  pub metadata: Option<Pubkey>,
  pub seller: Pubkey,
  pub mint: Pubkey,
  pub token_account: Pubkey,
  pub price_per_token: u64,
}