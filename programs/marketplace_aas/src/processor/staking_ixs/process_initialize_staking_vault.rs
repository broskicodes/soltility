use {
  anchor_lang::prelude::*,
  crate::context::staking_context::InitializeStakingVault,
  crate::error::*,
  spl_token::{
    instruction::{
      set_authority,
      AuthorityType,
    },
    ID as TOKEN_PROGRAM_ID,
  },
  solana_program::program::invoke,
};

pub fn process(
  ctx: Context<InitializeStakingVault>,
  min_lock_time: u32,
  daily_rate: u8,
) -> Result<()> {
  let stake_vault = &mut ctx.accounts.stake_vault;

  if ctx.accounts.organization.authority != *ctx.accounts.org_authority.key {
    return Err(error!(MarketplaceError::IncorrectOrgAuthority));
  }

  // if ctx.accounts.collection.

  let auth_ix = set_authority(
    &TOKEN_PROGRAM_ID,
    &ctx.accounts.reward_mint.key(),
    Some(&stake_vault.key()),
    AuthorityType::MintTokens,
    ctx.accounts.authority.key,
    &[],
  )?;

  invoke(
    &auth_ix,
    &[
      ctx.accounts.reward_mint.to_account_info(),
      ctx.accounts.authority.to_account_info(),
      stake_vault.to_account_info(),
    ]
  )?;

  stake_vault.authority = *ctx.accounts.authority.key;
  stake_vault.organization = ctx.accounts.organization.key();
  stake_vault.collection = ctx.accounts.collection.key();
  stake_vault.reward_mint = ctx.accounts.reward_mint.key();
  stake_vault.min_lock_time = min_lock_time;
  stake_vault.daily_rate = daily_rate;
  
  Ok(())
}