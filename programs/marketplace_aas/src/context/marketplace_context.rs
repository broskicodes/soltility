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
  mpl_token_metadata::ID as TOKEN_METADATA_PROGRAM_ID,
};

#[derive(Accounts)]
#[instruction(
  org_name: String,
  token_type: TokenType,
)]
pub struct InitializeMarketplace<'info> {
  #[account(
    init, payer = payer, space = 8+1+32+32+2+1+256,
    seeds = [
      b"marketplace".as_ref(),
      organization.key().as_ref(),
      (token_type.clone() as u8).to_le_bytes().as_ref(),
    ],
    bump,
  )]
  pub marketplace: Box<Account<'info, Marketplace>>,
  #[account(
    seeds = [
      b"organization".as_ref(),
      org_name.as_bytes(),
    ],
    bump,
  )]
  pub organization: Box<Account<'info, Organization>>,
  pub org_authority: Signer<'info>,
  pub update_authority: Signer<'info>,
  #[account(mut)]
  pub payer: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
  org_name: String,
  token_type: TokenType,
)]
pub struct ListNft<'info> {
  #[account(
    init_if_needed, payer = seller, space = 8+1+32+(4+32)+32+32+32+8+256, 
    seeds = [
      b"market-escrow".as_ref(),
      marketplace.key().as_ref(),
      collection.key().as_ref(),
      nft_mint.key().as_ref(),
      seller.key().as_ref(),
    ],
    bump,
  )]
  pub escrow_account: Box<Account<'info, MarketEscrow>>,
  #[account(
    init_if_needed, payer = seller,
    token::mint = nft_mint,
    token::authority = escrow_account,
    seeds = [
      b"token-account".as_ref(),
      escrow_account.key().as_ref(),
    ],
    bump,
  )]
  pub escrow_token_account: Box<Account<'info, TokenAccount>>,
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
    associated_token::authority = seller,
  )]
  pub seller_nft_token_account: Box<Account<'info, TokenAccount>>,
  #[account(
    seeds = [
      b"collection".as_ref(),
      collection_id.key.as_ref(),
    ],
    bump,
  )]
  pub collection: Box<Account<'info, Collection>>,
  #[account(
    seeds = [
      b"marketplace".as_ref(),
      organization.key().as_ref(),
      (token_type as u8).to_le_bytes().as_ref(),
    ],
    bump
  )]
  pub marketplace: Box<Account<'info, Marketplace>>,
  #[account(
    seeds = [
      b"organization".as_ref(),
      org_name.as_bytes(),
    ],
    bump,
  )]
  pub organization: Box<Account<'info, Organization>>,
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
#[instruction(
  org_name: String,
  token_type: TokenType,
)]
pub struct DelistNft<'info> {
  #[account(
    mut,
    seeds = [
      b"market-escrow".as_ref(),
      marketplace.key().as_ref(),
      collection.key().as_ref(),
      nft_mint.key().as_ref(),
      seller.key().as_ref(),
    ],
    bump,
    close = seller,
  )]
  pub escrow_account: Box<Account<'info, MarketEscrow>>,
  #[account(
    mut,
    seeds = [
      b"token-account".as_ref(),
      escrow_account.key().as_ref(),
    ],
    bump,
  )]
  pub escrow_token_account: Box<Account<'info, TokenAccount>>,
  pub nft_mint: Box<Account<'info, Mint>>,
  #[account(
    mut,
    associated_token::mint = nft_mint,
    associated_token::authority = seller,
  )]
  pub seller_nft_token_account: Box<Account<'info, TokenAccount>>,
  #[account(
    seeds = [
      b"collection".as_ref(),
      collection_id.key.as_ref(),
    ],
    bump,
  )]
  pub collection: Box<Account<'info, Collection>>,
  #[account(
    seeds = [
      b"marketplace".as_ref(),
      organization.key().as_ref(),
      (token_type as u8).to_le_bytes().as_ref(),
    ],
    bump,
  )]
  pub marketplace: Box<Account<'info, Marketplace>>,
  #[account(
    seeds = [
      b"organization".as_ref(),
      org_name.as_bytes(),
    ],
    bump,
  )]
  pub organization: Box<Account<'info, Organization>>,
  #[account(mut)]
  pub seller: Signer<'info>,
  /// CHECK: Candy Machine ID or Collection ID
  pub collection_id: UncheckedAccount<'info>,
  pub token_program: Program<'info, Token>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
  org_name: String,
  token_type: TokenType,
)]
pub struct BuyNft<'info> {
  #[account(
    mut,
    seeds = [
      b"market-escrow".as_ref(),
      marketplace.key().as_ref(),
      collection.key().as_ref(),
      nft_mint.key().as_ref(),
      seller.key().as_ref(),
    ],
    bump,
    close = seller,
  )]
  pub escrow_account: Box<Account<'info, MarketEscrow>>,
  #[account(
    mut,
    seeds = [
      b"token-account".as_ref(),
      escrow_account.key().as_ref(),
    ],
    bump,
  )]
  pub escrow_token_account: Box<Account<'info, TokenAccount>>,
  pub nft_mint: Box<Account<'info, Mint>>,
  #[account(
    init_if_needed, payer = buyer,
    associated_token::mint = nft_mint,
    associated_token::authority = buyer,
  )]
  pub buyer_nft_token_account: Box<Account<'info, TokenAccount>>,
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
    seeds = [
      b"collection".as_ref(),
      collection_id.key.as_ref(),
    ],
    bump,
  )]
  pub collection: Box<Account<'info, Collection>>,
  #[account(
    seeds = [
      b"marketplace".as_ref(),
      organization.key().as_ref(),
      (token_type as u8).to_le_bytes().as_ref(),
    ],
    bump
  )]
  pub marketplace: Box<Account<'info, Marketplace>>,
  #[account(
    seeds = [
      b"organization".as_ref(),
      org_name.as_bytes(),
    ],
    bump,
  )]
  pub organization: Box<Account<'info, Organization>>,
  #[account(
    mut,
    seeds = [
      b"organization-vault".as_ref(),
      organization.key().as_ref(),
    ],
    bump,
  )]
  /// CHECK: Organization's vault account, no data
  pub org_vault: UncheckedAccount<'info>,
  #[account(mut)]
  pub buyer: Signer<'info>,
  #[account(mut)]
  /// CHECK: Lister of the nft
  pub seller: UncheckedAccount<'info>,
  #[account(
    mut,
    seeds = [
      b"master-vault".as_ref(),
    ],
    bump,
  )]
  pub master_vault: Box<Account<'info, MasterVault>>,
  /// CHECK: Candy Machine ID or Collection ID
  pub collection_id: UncheckedAccount<'info>,
  pub rent: Sysvar<'info, Rent>,
  pub token_program: Program<'info, Token>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
  org_name: String,
  token_type: TokenType,
)]
pub struct ListToken<'info> {
  #[account(
    init, payer = seller, space = 8+1+32+(4+32)+32+32+32+8+256, 
    seeds = [
      b"market-escrow".as_ref(),
      marketplace.key().as_ref(),
      metadata_account.key().as_ref(),
      token_mint.key().as_ref(),
      seller.key().as_ref(),
    ],
    bump,
  )]
  pub escrow_account: Box<Account<'info, MarketEscrow>>,
  #[account(
    init, payer = seller,
    token::mint = token_mint,
    token::authority = escrow_account,
    seeds = [
      b"token-account".as_ref(),
      escrow_account.key().as_ref(),
    ],
    bump
  )]
  pub escrow_token_account: Box<Account<'info, TokenAccount>>,
  pub token_mint: Box<Account<'info, Mint>>,
  #[account(
    seeds = [
      b"metadata".as_ref(),  
      TOKEN_METADATA_PROGRAM_ID.as_ref(),
      token_mint.key().as_ref(),
    ],
    seeds::program = TOKEN_METADATA_PROGRAM_ID,
    bump,
  )]
  /// CHECK: Metaplex Metadata state account
  pub metadata_account: UncheckedAccount<'info>,
  #[account(
    mut,
    associated_token::mint = token_mint,
    associated_token::authority = seller,
  )]
  pub seller_token_account: Box<Account<'info, TokenAccount>>,
  #[account(
    seeds = [
      b"marketplace".as_ref(),
      organization.key().as_ref(),
      (token_type as u8).to_le_bytes().as_ref(),
    ],
    bump
  )]
  pub marketplace: Box<Account<'info, Marketplace>>,
  #[account(
    seeds = [
      b"organization".as_ref(),
      org_name.as_bytes(),
    ],
    bump,
  )]
  pub organization: Box<Account<'info, Organization>>,
  #[account(mut)]
  pub seller: Signer<'info>,
  pub rent: Sysvar<'info, Rent>,
  pub token_program: Program<'info, Token>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
  org_name: String,
  token_type: TokenType,
)]
pub struct DelistToken<'info> {
  #[account(
    mut,
    seeds = [
      b"market-escrow".as_ref(),
      marketplace.key().as_ref(),
      metadata_account.key().as_ref(),
      token_mint.key().as_ref(),
      seller.key().as_ref(),
    ],
    bump,
    close = seller,
  )]
  pub escrow_account: Box<Account<'info, MarketEscrow>>,
  #[account(
    mut,
    seeds = [
      b"token-account".as_ref(),
      escrow_account.key().as_ref(),
    ],
    bump
  )]
  pub escrow_token_account: Box<Account<'info, TokenAccount>>,
  pub token_mint: Box<Account<'info, Mint>>,
  #[account(
    seeds = [
      b"metadata".as_ref(),  
      TOKEN_METADATA_PROGRAM_ID.as_ref(),
      token_mint.key().as_ref(),
    ],
    seeds::program = TOKEN_METADATA_PROGRAM_ID,
    bump,
  )]
  /// CHECK: Metaplex Metadata state account
  pub metadata_account: UncheckedAccount<'info>,
  #[account(
    mut,
    associated_token::mint = token_mint,
    associated_token::authority = seller,
  )]
  pub seller_token_account: Box<Account<'info, TokenAccount>>,
  #[account(
    seeds = [
      b"marketplace".as_ref(),
      organization.key().as_ref(),
      (token_type as u8).to_le_bytes().as_ref(),
    ],
    bump
  )]
  pub marketplace: Box<Account<'info, Marketplace>>,
  #[account(
    seeds = [
      b"organization".as_ref(),
      org_name.as_bytes(),
    ],
    bump,
  )]
  pub organization: Box<Account<'info, Organization>>,
  #[account(mut)]
  pub seller: Signer<'info>,
  pub rent: Sysvar<'info, Rent>,
  pub token_program: Program<'info, Token>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(
  org_name: String,
  token_type: TokenType,
)]
pub struct BuyToken<'info> {
  #[account(
    mut,
    seeds = [
      b"market-escrow".as_ref(),
      marketplace.key().as_ref(),
      metadata_account.key().as_ref(),
      token_mint.key().as_ref(),
      seller.key().as_ref(),
    ],
    bump,
    // close = seller,
  )]
  pub escrow_account: Box<Account<'info, MarketEscrow>>,
  #[account(
    mut,
    seeds = [
      b"token-account".as_ref(),
      escrow_account.key().as_ref(),
    ],
    bump
  )]
  pub escrow_token_account: Box<Account<'info, TokenAccount>>,
  pub token_mint: Box<Account<'info, Mint>>,
  #[account(
    seeds = [
      b"metadata".as_ref(),  
      TOKEN_METADATA_PROGRAM_ID.as_ref(),
      token_mint.key().as_ref(),
    ],
    seeds::program = TOKEN_METADATA_PROGRAM_ID,
    bump,
  )]
  /// CHECK: Metaplex Metadata state account
  pub metadata_account: UncheckedAccount<'info>,
  #[account(
    init_if_needed, payer = buyer,
    associated_token::mint = token_mint,
    associated_token::authority = buyer,
  )]
  pub buyer_token_account: Box<Account<'info, TokenAccount>>,
  #[account(
    seeds = [
      b"marketplace".as_ref(),
      organization.key().as_ref(),
      (token_type as u8).to_le_bytes().as_ref(),
    ],
    bump
  )]
  pub marketplace: Box<Account<'info, Marketplace>>,
  #[account(
    seeds = [
      b"organization".as_ref(),
      org_name.as_bytes(),
    ],
    bump,
  )]
  pub organization: Box<Account<'info, Organization>>,
  #[account(
    mut,
    seeds = [
      b"organization-vault".as_ref(),
      organization.key().as_ref(),
    ],
    bump,
  )]
  /// CHECK: Organization's vault account, no data
  pub org_vault: UncheckedAccount<'info>,
  #[account(mut)]
  pub buyer: Signer<'info>,
  #[account(mut)]
  /// CHECK: Lister of the tokens
  pub seller: UncheckedAccount<'info>,
  #[account(
    mut,
    seeds = [
      b"master-vault".as_ref(),
    ],
    bump,
  )]
  pub master_vault: Box<Account<'info, MasterVault>>,
  pub rent: Sysvar<'info, Rent>,
  pub token_program: Program<'info, Token>,
  pub associated_token_program: Program<'info, AssociatedToken>,
  pub system_program: Program<'info, System>,
}