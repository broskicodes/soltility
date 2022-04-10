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
pub struct Escrow {
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