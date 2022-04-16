use {
  anchor_lang::prelude::*,
  crate::state::*,
  anchor_spl::{
    token::{
      Token,
    },
  },
};

#[derive(Accounts)]
pub struct InitializeGlobalTradeState<'info> {
  #[account(
    init, payer = payer, space = 8+8+8+8,
    seeds = [
      b"global-trade-state".as_ref(),
    ],
    bump,
  )]
  pub global_state: Box<Account<'info, GlobalTradeState>>,
  #[account(mut)]
  pub payer: Signer<'info>,
  pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(escrow_nonce: u64)]
pub struct CreateTradeOffer<'info> {
  #[account(
    init, payer = offerer, space = 8+8+32+(4+5*(8+(4+32)+4))+(4+5*(8+(4+32)+4))+(4+8)+(4+8)+(4+32),
    seeds = [
      b"trade-escrow".as_ref(),
      global_state.key().as_ref(),
      offerer.key.as_ref(),
      &escrow_nonce.to_le_bytes(),
    ],
    bump,
  )]
  pub escrow_account: Box<Account<'info, TradeEscrow>>,
  #[account(
    mut,
    seeds = [
      b"global-trade-state".as_ref(),
    ],
    bump,
  )]
  pub global_state: Box<Account<'info, GlobalTradeState>>,
  #[account(mut)]
  pub offerer: Signer<'info>,
  pub system_program: Program<'info, System>,
  pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(escrow_nonce: u64)]
pub struct WithdrawTradeOffer<'info> {
  #[account(
    mut,
    seeds = [
      b"trade-escrow".as_ref(),
      global_state.key().as_ref(),
      offerer.key.as_ref(),
      &escrow_nonce.to_le_bytes(),
    ],
    bump,
    close = offerer,
  )]
  pub escrow_account: Box<Account<'info, TradeEscrow>>,
  #[account(
    mut,
    seeds = [
      b"global-trade-state".as_ref(),
    ],
    bump,
  )]
  pub global_state: Box<Account<'info, GlobalTradeState>>,
  #[account(mut)]
  pub offerer: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(escrow_nonce: u64)]
pub struct FulfillTradeOffer<'info> {
  #[account(
    mut,
    seeds = [
      b"trade-escrow".as_ref(),
      global_state.key().as_ref(),
      offerer.key.as_ref(),
      &escrow_nonce.to_le_bytes(),
    ],
    bump,
    close = offerer,
  )]
  pub escrow_account: Box<Account<'info, TradeEscrow>>,
  #[account(
    mut,
    seeds = [
      b"global-trade-state".as_ref(),
    ],
    bump,
  )]
  pub global_state: Box<Account<'info, GlobalTradeState>>,
  #[account(mut)]
  pub offeree: Signer<'info>,
  #[account(mut)]
  pub offerer: SystemAccount<'info>,
  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token>,
  pub rent: Sysvar<'info, Rent>,
}