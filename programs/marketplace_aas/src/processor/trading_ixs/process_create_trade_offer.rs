use {
  anchor_lang::prelude::*,
  crate::context::trading_context::CreateTradeOffer,
  crate::state::TokenOffering,
  crate::error::*,
  spl_token::{
    instruction::{
      initialize_account,
    },
    ID as TOKEN_PROGRAM_ID,
  },
  solana_program::{
    rent::Rent,
    program::{invoke, invoke_signed},
    system_instruction::create_account,
  },
  anchor_spl::token::TokenAccount,
};

pub fn process<'a, 'b, 'c, 'info>(
  ctx: Context<'a, 'b, 'c, 'info, CreateTradeOffer<'info>>,
  escrow_nonce: u64,
  tokens_offering: Vec<TokenOffering>,
  tokens_requesting: Vec<TokenOffering>,
  lamports_offering: Option<u64>,
  lamports_requesting: Option<u64>,
  offeree: Option<Pubkey>,
) -> Result<()> {
  let escrow_account = &mut ctx.accounts.escrow_account;
  let offerer = &mut ctx.accounts.offerer;

  if escrow_nonce != ctx.accounts.global_state.next_escrow_nonce {
    return Err(error!(TradeError::MismatchedEscrowNonce));
  }

  if ctx.remaining_accounts.len() % 3 != 0 {
    return Err(error!(TradeError::InvalidRemainingAccounts));
  }

  let mut i = 0;
  for offering in tokens_offering.clone() {
    let mint_info = ctx.remaining_accounts.get(i).ok_or(TradeError::InvalidRemainingAccounts)?;
    let offerer_token_account_info = ctx.remaining_accounts.get(i+1).ok_or(TradeError::InvalidRemainingAccounts)?;
    let escrow_token_account_info = ctx.remaining_accounts.get(i+2).ok_or(TradeError::InvalidRemainingAccounts)?;

    if *mint_info.key != offering.mint.ok_or(TradeError::MissingOfferingMint)? {
      return Err(error!(TradeError::InvalidRemainingAccounts));
    }

    let offerer_token_account_data = TokenAccount::try_deserialize(&mut &offerer_token_account_info.try_borrow_data()?[..])?;

    if offerer_token_account_data.owner != *offerer.key || offerer_token_account_data.mint != *mint_info.key {
      return Err(error!(TradeError::InvalidRemainingAccounts));
    }

    let (escrow_token_account, bump) = Pubkey::find_program_address(
      &[
        b"token-account".as_ref(),
        escrow_account.key().as_ref(),
        mint_info.key.as_ref(),
      ],
      ctx.program_id,
    );

    if *escrow_token_account_info.key != escrow_token_account {
      return Err(error!(TradeError::InvalidRemainingAccounts));
    }

    let create_ix = create_account(
      offerer.key,
      &escrow_token_account,
      Rent::default().minimum_balance(165),
      165,
      &TOKEN_PROGRAM_ID,
    );

    invoke_signed(
      &create_ix,
      &[
        offerer.to_account_info(),
        escrow_token_account_info.clone(),
      ],
      &[
        &[
          b"token-account".as_ref(),
          escrow_account.key().as_ref(),
          mint_info.key.as_ref(),
          &[bump],
        ],
      ]
    )?;

    let init_ix = initialize_account(
      &TOKEN_PROGRAM_ID,
      &escrow_token_account,
      mint_info.key,
      &escrow_account.key(),
    )?;

    invoke(
      &init_ix,
      &[
        escrow_token_account_info.clone(),
        mint_info.clone(),
        escrow_account.to_account_info(),
        ctx.accounts.rent.to_account_info(),
      ]
    )?;

    let transfer_ix = spl_token::instruction::transfer(
      &TOKEN_PROGRAM_ID,
      offerer_token_account_info.key,
      &escrow_token_account,
      &offerer.key(),
      &[],
      offering.amount // Must be 1 for nfts. For tokens can be anything > 0
    )?;

    invoke(
      &transfer_ix,
      &[
        offerer_token_account_info.clone(),
        escrow_token_account_info.clone(),
        offerer.to_account_info(),
      ]
    )?;

    i += 3;
  }

  match lamports_offering {
    Some(amount) => {
      invoke(
        &solana_program::system_instruction::transfer(
          offerer.key,
          &escrow_account.key(),
          amount,
        ),
        &[
          offerer.to_account_info(),
          escrow_account.to_account_info(),
        ]
      )?;
    },
    None => {},
  };

  ctx.accounts.global_state.next_escrow_nonce += 1;
  ctx.accounts.global_state.pending_offers += 1;

  escrow_account.nonce = escrow_nonce;
  escrow_account.offerer = *offerer.key;
  escrow_account.tokens_offering = tokens_offering;
  escrow_account.tokens_requesting = tokens_requesting;
  escrow_account.lamports_offering = lamports_offering;
  escrow_account.lamports_requesting = lamports_requesting;
  escrow_account.offeree = offeree;

  Ok(())
}