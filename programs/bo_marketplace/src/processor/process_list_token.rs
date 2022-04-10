use {
  anchor_lang::prelude::*,
  crate::context::ListToken,
  crate::state::*,
  crate::error::*,
  solana_program::{
    program::invoke,
  },
  spl_token::instruction::transfer,
  mpl_token_metadata::{
    state::Metadata,
  },
};

pub fn process_list_token(
  ctx: Context<ListToken>,
  token_type: TokenType,
  price_per_token: u64,
  amount: u64,
) -> Result<()> {
  let escrow_account = &mut ctx.accounts.escrow_account;
  let metadata = match Metadata::from_account_info(&ctx.accounts.metadata_account.to_account_info()) {
    Ok(_mtdt) => {
      Some(*ctx.accounts.metadata_account.key)
    },
    _ => None
  };

  match token_type {
    TokenType::Fungible => Ok(()),
    _ => Err(error!(MarketplaceError::WrongMarketplace))
  }?;

  let ix = transfer(
    ctx.accounts.token_program.key,
    &ctx.accounts.seller_token_account.key(),
    &ctx.accounts.escrow_token_account.key(),
    ctx.accounts.seller.key,
    &[],
    amount,
  )?;

  invoke(
    &ix,
    &[
      ctx.accounts.seller.to_account_info(),
      ctx.accounts.escrow_token_account.to_account_info(),
      ctx.accounts.seller_token_account.to_account_info(),
    ],
  )?;
  
  escrow_account.metadata = metadata;
  escrow_account.seller = ctx.accounts.seller.key();
  escrow_account.mint = ctx.accounts.token_mint.key();
  escrow_account.token_account = ctx.accounts.escrow_token_account.key();
  escrow_account.price_per_token = price_per_token;
  escrow_account.token_type = TokenType::Fungible;
  escrow_account.marketplace = ctx.accounts.marketplace.key();

  Ok(())
}