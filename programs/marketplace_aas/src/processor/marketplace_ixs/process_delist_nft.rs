use {
  anchor_lang::prelude::*,
  crate::context::marketplace_context::DelistNft,
  crate::error::*,
  solana_program::{
    program::invoke_signed,
  },
  spl_token::instruction::{
    transfer,
    close_account,
  },
};

pub fn process(
  ctx: Context<DelistNft>,
) -> Result<()> {
  let escrow_account = &mut ctx.accounts.escrow_account;
  let escrow_bump = *ctx.bumps.get("escrow_account").ok_or(CustomError::MissingBump)?;

  if escrow_account.seller != *ctx.accounts.seller.key {
    return Err(error!(CustomError::UnknownSeller));
  }

  let transfer_ix = transfer(
    ctx.accounts.token_program.key,
    &ctx.accounts.escrow_token_account.key(),
    &ctx.accounts.seller_nft_token_account.key(),
    &ctx.accounts.escrow_account.key(),
    &[],
    1,
  )?;

  invoke_signed(
    &transfer_ix,
    &[
      ctx.accounts.escrow_account.to_account_info(),
      ctx.accounts.escrow_token_account.to_account_info(),
      ctx.accounts.seller_nft_token_account.to_account_info(),
    ],
    &[
      &[
        b"escrow".as_ref(),
        ctx.accounts.marketplace.key().as_ref(),
        ctx.accounts.collection.key().as_ref(),
        ctx.accounts.nft_mint.key().as_ref(),
        ctx.accounts.seller.key().as_ref(),
        &[escrow_bump],
      ],
    ],
  )?;

  let close_ix = close_account(
    ctx.accounts.token_program.key,
    &ctx.accounts.escrow_token_account.key(),
    &ctx.accounts.seller.key(),
    &ctx.accounts.escrow_account.key(),
    &[],
  )?;

  invoke_signed(
    &close_ix,
    &[
      ctx.accounts.escrow_account.to_account_info(),
      ctx.accounts.escrow_token_account.to_account_info(),
      ctx.accounts.seller.to_account_info(),
    ],
    &[
      &[
        b"escrow".as_ref(),
        ctx.accounts.marketplace.key().as_ref(),
        ctx.accounts.collection.key().as_ref(),
        ctx.accounts.nft_mint.key().as_ref(),
        ctx.accounts.seller.key().as_ref(),
        &[escrow_bump],
      ],
    ],
  )?;

  Ok(())
}