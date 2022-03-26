use {
  anchor_lang::prelude::*,
  crate::context::InitializeMarketplace,
  solana_program::entrypoint::ProgramResult,
};

pub fn process_initialize_marketplace(
  ctx: Context<InitializeMarketplace>,
) -> ProgramResult {
  msg!("Done");
  Ok(())
}