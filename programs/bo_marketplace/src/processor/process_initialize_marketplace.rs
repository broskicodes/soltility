use {
  anchor_lang::prelude::*,
  crate::context::InitializeMarketplace,
  crate::state::TokenType,
  crate::error::MarketplaceError,
};

pub fn process_initialize_marketplace(
  ctx: Context<InitializeMarketplace>,
  token_type: TokenType,
  fee: u8,
  is_mutable: bool,
) -> Result<()> {
  let marketplace = &mut ctx.accounts.marketplace;

  if fee > 100 {
    return Err(error!(MarketplaceError::InvalidMarketplaceFee));
  }

  marketplace.fee = fee;
  marketplace.token_type = token_type;
  marketplace.update_authority = *ctx.accounts.update_authority.key;
  marketplace.is_mutable = is_mutable;

  Ok(())
}