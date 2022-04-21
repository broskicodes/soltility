pub mod marketplace_context;
pub mod trading_context;
pub mod staking_context;

use {
  anchor_lang::prelude::*,
  crate::state::*,
  anchor_spl::{
    token::{
      Mint, 
      // Token,
    },
  },
};

#[derive(Accounts)]
pub struct InitializeMasterVault<'info> {
  #[account(
    init, payer = payer, space = 8+32+2+256,
    seeds = [
      b"master-vault".as_ref()
    ],
    bump,
  )]
  pub master_vault: Box<Account<'info, MasterVault>>,
  pub authority: Signer<'info>,
  #[account(mut)]
  pub payer: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(org_name: String)]
pub struct InitializeOrganization<'info> {
  #[account(
    init, payer = payer, space = 8+32+(4+32)+(4+32)+256,
    seeds = [
      b"organization".as_ref(),
      org_name.as_bytes(),
    ],
    bump,
  )]
  pub organization: Box<Account<'info, Organization>>,
  #[account(
    init, payer = payer, space = 0,
    seeds = [
      b"organization-vault".as_ref(),
      organization.key().as_ref(),
    ],
    bump,
  )]
  /// CHECK: Organization's vault account, no data
  pub org_vault: UncheckedAccount<'info>,
  pub authority: Signer<'info>,
  #[account(mut)]
  pub payer: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterStandardCollection<'info> {
  #[account(
    init, payer = payer, space = 8+1+32+(4+32)+256,
    seeds = [
      b"collection".as_ref(),
      collection_id.key.as_ref(),
    ],
    bump,
  )]
  pub collection: Box<Account<'info, Collection>>,
  #[account(mut)]
  pub payer: Signer<'info>,
  pub nft_mint: Account<'info, Mint>,
  #[account(
    seeds = [
      b"metadata".as_ref(),  
      mpl_token_metadata::ID.as_ref(),
      nft_mint.key().as_ref(),
    ],
    seeds::program = mpl_token_metadata::ID,
    bump,
  )]
  /// CHECK: Metaplex Metadata state account
  pub metadata_account: UncheckedAccount<'info>,
  /// CHECK: Candy Machine ID or Collection ID
  pub collection_id: UncheckedAccount<'info>,
  pub system_program: Program<'info, System>,
}

// #[derive(Accounts)]
// pub struct CreateTokenMetadata<'info> {
//   #[account(
//     mut,
//     seeds = [
//       b"metadata".as_ref(),  
//       mpl_token_metadata::ID.as_ref(),
//       mint.key().as_ref(),
//     ],
//     seeds::program = mpl_token_metadata::ID,
//     bump,
//   )]
//   /// CHECK: Metaplex Metadata state account
//   pub metadata_account: UncheckedAccount<'info>,
//   // #[account(
//   //   init_if_needed, payer = payer,
//   //   mint::authority = mint_authority,
//   //   mint::decimals = 6,
//   // )]
//   pub mint: Account<'info, Mint>,
//   pub mint_authority: Signer<'info>,
//   pub update_authority: Signer<'info>,
//   #[account(mut)]
//   pub payer: Signer<'info>,
//   pub rent: Sysvar<'info, Rent>,
//   pub system_program: Program<'info, System>,
//   pub token_program: Program<'info, Token>,
//   #[account(address = mpl_token_metadata::ID)]
//   /// CHECK: Token Metadata Program
//   pub token_metadata_program: UncheckedAccount<'info>
// }