use {
  anchor_lang::prelude::*,
  crate::context::InitializeMasterVault,
  crate::error::CustomError,
};

pub fn process(
  ctx: Context<InitializeMasterVault>,
  fee: u16,
) -> Result<()> {
  let master_vault = &mut ctx.accounts.master_vault;

  if fee > 10000 {
    return Err(error!(CustomError::InvalidFee));
  }

  master_vault.fee = fee;
  master_vault.authority = *ctx.accounts.authority.key;

  Ok(())
}