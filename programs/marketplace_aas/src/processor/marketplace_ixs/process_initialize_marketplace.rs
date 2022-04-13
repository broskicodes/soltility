use {
  anchor_lang::prelude::*,
  crate::context::marketplace_context::InitializeMarketplace,
  crate::state::TokenType,
  crate::error::MarketplaceError,
};

pub fn process(
  ctx: Context<InitializeMarketplace>,
  token_type: TokenType,
  fee: u16,
  is_mutable: bool,
) -> Result<()> {
  let marketplace = &mut ctx.accounts.marketplace;

  if fee > 10000 {
    return Err(error!(MarketplaceError::InvalidFee));
  }

  if *ctx.accounts.org_authority.key != ctx.accounts.organization.authority {
    return Err(error!(MarketplaceError::IncorrectOrgAuthority))
  }

  marketplace.fee = fee;
  marketplace.token_type = token_type;
  marketplace.update_authority = *ctx.accounts.update_authority.key;
  marketplace.organization = ctx.accounts.organization.key();
  marketplace.is_mutable = is_mutable;

  Ok(())
}