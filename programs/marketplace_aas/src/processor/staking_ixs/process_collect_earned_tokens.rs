use {
  anchor_lang::prelude::*,
  crate::context::staking_context::CollectEarnedTokens,
  crate::error::*,
  crate::utils::ONE_DAY,
  spl_token::instruction::mint_to,
  solana_program::program::invoke_signed,
};

pub fn process(
  ctx: Context<CollectEarnedTokens>,
) -> Result<()> {
  let escrow_account = &mut ctx.accounts.escrow_account;
  let stake_vault_bump = *ctx.bumps.get("stake_vault").ok_or(MarketplaceError::MissingBump)?;

  if ctx.accounts.reward_mint.key() != ctx.accounts.stake_vault.reward_mint {
    return Err(error!(StakeError::IncorrectRewardMint));
  }

  let mint_amount 
    = (ctx.accounts.clock.unix_timestamp 
    - escrow_account.last_claimed_date) as u64 
    / ONE_DAY
    * escrow_account.daily_rate as u64
    * ctx.accounts.reward_mint.decimals as u64;

  let mint_ix = mint_to(
    ctx.accounts.token_program.key,
    &ctx.accounts.reward_mint.key(),
    &ctx.accounts.user_reward_token_account.key(),
    &ctx.accounts.stake_vault.key(),
    &[],
    mint_amount,
  )?;

  invoke_signed(
    &mint_ix, 
    &[
      ctx.accounts.reward_mint.to_account_info(),
      ctx.accounts.user_reward_token_account.to_account_info(),
      ctx.accounts.stake_vault.to_account_info(),
    ],
    &[
      &[
        b"stake-vault".as_ref(),
        ctx.accounts.organization.key().as_ref(),
        ctx.accounts.collection.key().as_ref(),
        &[stake_vault_bump],
      ]
    ]
  )?;

  escrow_account.last_claimed_date = ctx.accounts.clock.unix_timestamp;

  Ok(())
}