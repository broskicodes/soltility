use {
  anchor_lang::prelude::*,
};

#[derive(Clone, Debug, AnchorSerialize, AnchorDeserialize)]
pub enum CandyMachineVersion {
  V1,
  V2,
  // Multiple,
}

#[account]
pub struct Marketplace {
  
}

#[account]
pub struct Collection {
  pub version: CandyMachineVersion,
  pub collection_id: Pubkey,
  pub size: u32,
  pub name: String,
  // pub hash_list: Option<Pubkey>,
  pub hash_list_link: Option<String>,
}

#[account]
pub struct HashList {
  collection: Pubkey,
  mints: Vec<Pubkey>,
}

#[account]
pub struct Escrow {
  pub active: bool,
  pub collection: Pubkey,
  pub seller: Pubkey,
  pub mint: Pubkey,
  pub token_account: Pubkey,
  pub price: u64,
}