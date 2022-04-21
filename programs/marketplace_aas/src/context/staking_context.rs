use {
  anchor_lang::prelude::*,
  crate::state::*,
  anchor_spl::{
    associated_token::AssociatedToken,
    token::{
      Mint, 
      TokenAccount,
      Token,
    },
  },
  mpl_token_metadata::ID as TOKEN_METADATA_PROGRAM_ID,
};

#[derive(Accounts)]
#[instruction(org_name: String)]
pub struct InitializeStakingVault<'info> {
  #[account(
    init, payer = authority, space = 8+32+32+32+32+4+1,
    seeds = [
      b"stake-vault".as_ref(),
      organization.key().as_ref(),
      collection.key().as_ref(),
    ],
    bump,
  )]
  pub stake_vault: Box<Account<'info, StakeVault>>,
  #[account(
    seeds = [
      b"organization".as_ref(),
      org_name.as_bytes(),
    ],
    bump,
  )]
  pub organization: Box<Account<'info, Organization>>,
  pub org_authority: Signer<'info>,
  #[account(
    seeds = [
      b"collection".as_ref(),
      collection_id.key.as_ref(),
    ],
    bump,
  )]
  pub collection: Box<Account<'info, Collection>>,
  #[account(mut)]
  pub reward_mint: Box<Account<'info, Mint>>,
  /// CHECK: Candy Machine ID or Collection ID
  pub collection_id: UncheckedAccount<'info>,
  #[account(mut)]
  pub authority: Signer<'info>,
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
#[instruction(org_name: String)]
pub struct StakeNft<'info> {
  #[account(
    init, payer = user, space = 8+32+32+32+1+8+8,
    seeds = [
      b"stake-escrow".as_ref(),
      stake_vault.key().as_ref(),
      user.key.as_ref(),
      nft_mint.key().as_ref()
    ],
    bump,
  )]
  pub escrow_account: Box<Account<'info, StakeEscrow>>,
  #[account(
    init, payer = user,
    token::mint = nft_mint,
    token::authority = escrow_account,
    seeds = [
      b"token-account".as_ref(),
      escrow_account.key().as_ref(),
    ],
    bump,
  )]
  pub escrow_token_account: Box<Account<'info, TokenAccount>>,
  #[account(
    seeds = [
      b"stake-vault".as_ref(),
      organization.key().as_ref(),
      collection.key().as_ref(),
    ],
    bump,
  )]
  pub stake_vault: Box<Account<'info, StakeVault>>,
  #[account(
    seeds = [
      b"organization".as_ref(),
      org_name.as_bytes(),
    ],
    bump,
  )]
  pub organization: Box<Account<'info, Organization>>,
  #[account(
    seeds = [
      b"collection".as_ref(),
      collection_id.key.as_ref(),
    ],
    bump,
  )]
  pub collection: Box<Account<'info, Collection>>,
  pub nft_mint: Box<Account<'info, Mint>>,
  #[account(
    seeds = [
      b"metadata".as_ref(),  
      TOKEN_METADATA_PROGRAM_ID.as_ref(),
      nft_mint.key().as_ref(),
    ],
    seeds::program = TOKEN_METADATA_PROGRAM_ID,
    bump,
  )]
  /// CHECK: Metaplex Metadata state account
  pub nft_metadata_account: UncheckedAccount<'info>,
  #[account(
    mut,
    associated_token::mint = nft_mint,
    associated_token::authority = user,
  )]
  pub user_nft_token_account: Box<Account<'info, TokenAccount>>,
  #[account(mut)]
  pub user: Signer<'info>,
  /// CHECK: Candy Machine ID or Collection ID
  pub collection_id: UncheckedAccount<'info>,
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token>,
  pub rent: Sysvar<'info, Rent>,
  pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
#[instruction(org_name: String)]
pub struct CollectEarnedTokens<'info> {
  #[account(
    mut,
    seeds = [
      b"stake-escrow".as_ref(),
      stake_vault.key().as_ref(),
      user.key.as_ref(),
      nft_mint.key().as_ref(),
    ],
    bump,
  )]
  pub escrow_account: Box<Account<'info, StakeEscrow>>,
  #[account(mut)]
  pub reward_mint: Box<Account<'info, Mint>>,
  #[account(
    init_if_needed, payer = user,
    associated_token::mint = reward_mint,
    associated_token::authority = user,
  )]
  pub user_reward_token_account: Box<Account<'info, TokenAccount>>,
  #[account(
    seeds = [
      b"stake-vault".as_ref(),
      organization.key().as_ref(),
      collection.key().as_ref(),
    ],
    bump,
  )]
  pub stake_vault: Box<Account<'info, StakeVault>>,
  #[account(
    seeds = [
      b"organization".as_ref(),
      org_name.as_bytes(),
    ],
    bump,
  )]
  pub organization: Box<Account<'info, Organization>>,
  #[account(
    seeds = [
      b"collection".as_ref(),
      collection_id.key.as_ref(),
    ],
    bump,
  )]
  pub collection: Box<Account<'info, Collection>>,
  pub nft_mint: Box<Account<'info, Mint>>,
  #[account(mut)]
  pub user: Signer<'info>,
  /// CHECK: Candy Machine ID or Collection ID
  pub collection_id: UncheckedAccount<'info>,
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub rent: Sysvar<'info, Rent>,
  pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
#[instruction(org_name: String)]
pub struct UnstakeNft<'info> {
  #[account(
    mut,
    seeds = [
      b"stake-escrow".as_ref(),
      stake_vault.key().as_ref(),
      user.key.as_ref(),
      nft_mint.key().as_ref(),
    ],
    bump,
    close = user,
  )]
  pub escrow_account: Box<Account<'info, StakeEscrow>>,
  #[account(
    mut,
    seeds = [
      b"token-account".as_ref(),
      escrow_account.key().as_ref(),
    ],
    bump,
  )]
  pub escrow_token_account: Box<Account<'info, TokenAccount>>,
  #[account(
    seeds = [
      b"stake-vault".as_ref(),
      organization.key().as_ref(),
      collection.key().as_ref(),
    ],
    bump,
  )]
  pub stake_vault: Box<Account<'info, StakeVault>>,
  #[account(
    seeds = [
      b"organization".as_ref(),
      org_name.as_bytes(),
    ],
    bump,
  )]
  pub organization: Box<Account<'info, Organization>>,
  #[account(
    seeds = [
      b"collection".as_ref(),
      collection_id.key.as_ref(),
    ],
    bump,
  )]
  pub collection: Box<Account<'info, Collection>>,
  pub nft_mint: Box<Account<'info, Mint>>,
  #[account(
    mut,
    associated_token::mint = nft_mint,
    associated_token::authority = user,
  )]
  pub user_nft_token_account: Box<Account<'info, TokenAccount>>,
  #[account(mut)]
  pub user: Signer<'info>,
  /// CHECK: Candy Machine ID or Collection ID
  pub collection_id: UncheckedAccount<'info>,
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub rent: Sysvar<'info, Rent>,
  pub clock: Sysvar<'info, Clock>,
}