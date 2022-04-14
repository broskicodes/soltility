use {
  anchor_lang::prelude::*,
  crate::context::staking_context::UnstakeNft,
  crate::error::*,
  spl_token::instruction::{
    transfer,
    close_account,
  },
  solana_program::program::invoke_signed,
};

pub fn process(
  ctx: Context<UnstakeNft>,
) -> Result<()> {
  let escrow_account = &mut ctx.accounts.escrow_account;
  let escrow_bump = *ctx.bumps.get("escrow_account").ok_or(MarketplaceError::MissingBump)?;

  if ctx.accounts.clock.unix_timestamp - escrow_account.start_date < ctx.accounts.stake_vault.min_lock_time as i64 {
    return Err(error!(StakeError::NftLocked));
  }

  let transfer_ix = transfer(
    ctx.accounts.token_program.key,
    &ctx.accounts.escrow_token_account.key(),
    &ctx.accounts.user_nft_token_account.key(),
    &escrow_account.key(),
    &[],
    1,
  )?;

  invoke_signed(
    &transfer_ix,
    &[
      escrow_account.to_account_info(),
      ctx.accounts.escrow_token_account.to_account_info(),
      ctx.accounts.user_nft_token_account.to_account_info(),
    ],
    &[
      &[
        b"stake-escrow".as_ref(),
        ctx.accounts.stake_vault.key().as_ref(),
        ctx.accounts.user.key.as_ref(),
        ctx.accounts.nft_mint.key().as_ref(),
        &[escrow_bump],
      ],
    ],
  )?;

  let close_ix = close_account(
    ctx.accounts.token_program.key,
    &ctx.accounts.escrow_token_account.key(),
    ctx.accounts.user.key,
    &ctx.accounts.escrow_account.key(),
    &[],
  )?;

  invoke_signed(
    &close_ix,
    &[
      ctx.accounts.escrow_account.to_account_info(),
      ctx.accounts.escrow_token_account.to_account_info(),
      ctx.accounts.user.to_account_info(),
    ],
    &[
      &[
        b"stake-escrow".as_ref(),
        ctx.accounts.stake_vault.key().as_ref(),
        ctx.accounts.user.key.as_ref(),
        ctx.accounts.nft_mint.key().as_ref(),
        &[escrow_bump],
      ],
    ],
  )?;

  Ok(())
}