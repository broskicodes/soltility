use {
  anchor_lang::prelude::*,
  crate::context::CreateTokenMetadata,
  solana_program::{
    program::invoke,
  },
  mpl_token_metadata::{
    instruction::create_metadata_accounts_v2,
    ID as TOKEN_METADATA_PROGRAM
  },
};

pub fn process(
  ctx: Context<CreateTokenMetadata>,
  name: String,
  symbol: String,
) -> Result<()> {
  let ix = create_metadata_accounts_v2(
    TOKEN_METADATA_PROGRAM,
    *ctx.accounts.metadata_account.key,
    ctx.accounts.mint.key(),
    *ctx.accounts.mint_authority.key,
    *ctx.accounts.payer.key,
    *ctx.accounts.update_authority.key,
    name,
    symbol,
    String::from(""),
    None,
    0,
    true,
    true,
    None,
    None,
  );

  invoke(
    &ix,
    &[
      ctx.accounts.metadata_account.to_account_info(),
      ctx.accounts.mint.to_account_info(),
      ctx.accounts.mint_authority.to_account_info(),
      ctx.accounts.payer.to_account_info(),
      ctx.accounts.update_authority.to_account_info(),
      ctx.accounts.system_program.to_account_info(),
      ctx.accounts.rent.to_account_info(),
      ctx.accounts.token_metadata_program.to_account_info(),
    ]
  )?;

  Ok(())
}