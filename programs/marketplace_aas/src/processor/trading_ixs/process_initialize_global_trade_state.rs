use {
  anchor_lang::prelude::*,
  crate::context::trading_context::InitializeGlobalTradeState,
  // crate::error::*,
};

// Consider making this only callable by program update authority

pub fn process(
  ctx: Context<InitializeGlobalTradeState>,
) -> Result<()> {
  let global_state = &mut ctx.accounts.global_state;

  global_state.next_escrow_nonce = 0;
  global_state.pending_offers = 0;
  global_state.completed_trades = 0;

  Ok(())
}