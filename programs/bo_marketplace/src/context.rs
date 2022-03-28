use {
  anchor_lang::prelude::*,
  crate::state::*,
  anchor_spl::{
    token::{
      Mint, 
      TokenAccount,
      Token,
    },
    associated_token::AssociatedToken,
  },
};

#[derive(Accounts)]
pub struct InitializeMarketplace<'info> {
  #[account(
    init, payer = payer, space = 32,
    seeds = [
      b"marketplace".as_ref()
    ],
    bump
  )]
  pub marketplace: Account<'info, Marketplace>,
  #[account(mut)]
  pub payer: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterStandardCollection<'info> {
  #[account(
    init, payer = payer, space = 8+1+32+4+(4+32)+(1+4+128),
    seeds = [
      b"collection".as_ref(),
      marketplace.key().as_ref(),
      collection_id.key.as_ref(),
    ],
    bump,
  )]
  pub collection: Account<'info, Collection>,
  #[account(
    seeds = [
      b"marketplace".as_ref(),
    ],
    bump
  )]
  pub marketplace: Account<'info, Marketplace>,
  #[account(mut)]
  pub payer: Signer<'info>,
  /// CHECK: Candy Machine ID or Collection ID
  pub collection_id: UncheckedAccount<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
// #[instruction(escrow_nonce: u8)]
pub struct ListNft<'info> {
  #[account(
    init_if_needed, payer = seller, space = 8+1+32+32+32+32+8, 
    seeds = [
      b"escrow".as_ref(),
      marketplace.key().as_ref(),
      collection.key().as_ref(),
      nft_mint.key().as_ref(),
      seller.key().as_ref(),
    ],
    bump,
  )]
  pub escrow_account: Box<Account<'info, Escrow>>,
  #[account(
    init_if_needed, payer = seller,
    token::mint = nft_mint,
    token::authority = escrow_account,
    seeds = [
      b"token-account".as_ref(),
      escrow_account.key().as_ref(),
    ],
    bump
  )]
  pub escrow_token_account: Account<'info, TokenAccount>,
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
  pub nft_metadata_account: UncheckedAccount<'info>,
  #[account(
    associated_token::mint = nft_mint,
    associated_token::authority = seller,
  )]
  #[account(mut)]
  pub seller_nft_token_account: Account<'info, TokenAccount>,
  #[account(
    seeds = [
      b"collection".as_ref(),
      marketplace.key().as_ref(),
      collection_id.key().as_ref(),
    ],
    bump,
  )]
  pub collection: Account<'info, Collection>,
  #[account(
    seeds = [
      b"marketplace".as_ref(),
    ],
    bump
  )]
  pub marketplace: Account<'info, Marketplace>,
  #[account(mut)]
  pub seller: Signer<'info>,
  /// CHECK: Candy Machine ID or Collection ID
  pub collection_id: UncheckedAccount<'info>,
  pub rent: Sysvar<'info, Rent>,
  pub token_program: Program<'info, Token>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(escrow_nonce: u8)]
pub struct DelistNft<'info> {
  #[account(
    mut,
    seeds = [
      b"escrow".as_ref(),
      marketplace.key().as_ref(),
      collection.key().as_ref(),
      nft_mint.key().as_ref(),
      seller.key().as_ref(),
    ],
    bump = escrow_nonce,
    close = seller,
  )]
  pub escrow_account: Account<'info, Escrow>,
  #[account(
    mut,
    seeds = [
      b"token-account".as_ref(),
      escrow_account.key().as_ref(),
    ],
    bump,
  )]
  pub escrow_token_account: Account<'info, TokenAccount>,
  pub nft_mint: Account<'info, Mint>,
  #[account(
    mut,
    associated_token::mint = nft_mint,
    associated_token::authority = seller,
  )]
  pub seller_nft_token_account: Account<'info, TokenAccount>,
  #[account(
    seeds = [
      b"collection".as_ref(),
      marketplace.key().as_ref(),
      collection_id.key().as_ref(),
    ],
    bump,
  )]
  pub collection: Account<'info, Collection>,
  #[account(
    seeds = [
      b"marketplace".as_ref(),
    ],
    bump
  )]
  pub marketplace: Account<'info, Marketplace>,
  #[account(mut)]
  pub seller: Signer<'info>,
  /// CHECK: Candy Machine ID or Collection ID
  pub collection_id: UncheckedAccount<'info>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
  escrow_nonce: u8,
  vault_nonce: u8,
)]
pub struct BuyNft<'info> {
  #[account(
    mut,
    seeds = [
      b"escrow".as_ref(),
      marketplace.key().as_ref(),
      collection.key().as_ref(),
      nft_mint.key().as_ref(),
      seller.key().as_ref(),
    ],
    bump = escrow_nonce,
    close = seller,
  )]
  pub escrow_account: Box<Account<'info, Escrow>>,
  #[account(
    mut,
    seeds = [
      b"token-account".as_ref(),
      escrow_account.key().as_ref(),
    ],
    bump,
  )]
  pub escrow_token_account: Box<Account<'info, TokenAccount>>,
  pub nft_mint: Account<'info, Mint>,
  #[account(
    init_if_needed, payer = buyer,
    associated_token::mint = nft_mint,
    associated_token::authority = buyer,
  )]
  pub buyer_nft_token_account: Box<Account<'info, TokenAccount>>,
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
  pub nft_metadata_account: UncheckedAccount<'info>,
  #[account(
    seeds = [
      b"collection".as_ref(),
      marketplace.key().as_ref(),
      collection_id.key().as_ref(),
    ],
    bump,
  )]
  pub collection: Box<Account<'info, Collection>>,
  #[account(
    seeds = [
      b"marketplace".as_ref(),
    ],
    bump
  )]
  pub marketplace: Box<Account<'info, Marketplace>>,
  #[account(mut)]
  pub buyer: Signer<'info>,
  #[account(mut)]
  /// CHECK: Lister of the nft
  pub seller: UncheckedAccount<'info>,
  #[account(
    mut,
    seeds = [
      b"marketplace-vault".as_ref(),
      marketplace.key().as_ref(),
    ],
    bump = vault_nonce,
  )]
  /// CHECK: Vault account for transfering funds, no data
  pub marketplace_vault: UncheckedAccount<'info>,
  /// CHECK: Candy Machine ID or Collection ID
  pub collection_id: UncheckedAccount<'info>,
  pub rent: Sysvar<'info, Rent>,
  pub token_program: Program<'info, Token>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub system_program: Program<'info, System>,
}