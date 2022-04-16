use {
  anchor_lang::prelude::*,
  crate::context::trading_context::FulfillTradeOffer,
  crate::error::*,
  crate::utils::*,
  spl_token::{
    instruction::{
      close_account,
    },
    ID as TOKEN_PROGRAM_ID,
  },
  spl_associated_token_account::{
    create_associated_token_account,
    get_associated_token_address,
  },
  solana_program::{
    program::{invoke, invoke_signed},
  },
  anchor_spl::token::TokenAccount,
};

pub fn process<'a, 'b, 'c, 'info>(
  ctx: Context<'a, 'b, 'c, 'info, FulfillTradeOffer<'info>>,
) -> Result<()> {
  let escrow_account = &mut ctx.accounts.escrow_account;
  let offerer = &mut ctx.accounts.offerer;
  let offeree = &mut ctx.accounts.offeree;
  let escrow_bump = *ctx.bumps.get("escrow_account").ok_or(CustomError::MissingBump)?;

  if *offerer.key != escrow_account.offerer {
    return Err(error!(CustomError::InvalidOfferer));
  }

  match escrow_account.offeree {
    Some(key) => {
      if *offeree.key != key {
        return Err(error!(CustomError::InvalidOfferee));
      }
    },
    None => {}
  };

  if ctx.remaining_accounts.len() % 3 != 0 {
    return Err(error!(CustomError::InvalidRemainingAccounts));
  }

  let mut i = 0;
  for request in escrow_account.tokens_requesting.clone() {
    // match request.collection {
    //   Some(collection) => {
    //     for _ in 0..request.amount {

    //     }
    //   },
    //   None => {
        
    //   }
    // }

    let mint_info = ctx.remaining_accounts.get(i).ok_or(CustomError::InvalidRemainingAccounts)?;
    let offeree_token_account_info = ctx.remaining_accounts.get(i+1).ok_or(CustomError::InvalidRemainingAccounts)?;
    let offerer_token_account_info = ctx.remaining_accounts.get(i+2).ok_or(CustomError::InvalidRemainingAccounts)?;

    if *mint_info.key != request.mint.ok_or(CustomError::MissingOfferingMint)? {
      return Err(error!(CustomError::InvalidRemainingAccounts));
    }

    let offeree_token_account_data = TokenAccount::try_deserialize(&mut &offeree_token_account_info.try_borrow_data()?[..])?;
    if offeree_token_account_data.owner != *offeree.key || offeree_token_account_data.mint != *mint_info.key {
      return Err(error!(CustomError::InvalidRemainingAccounts));
    }

    let offerer_token_account_data = TokenAccount::try_deserialize(&mut &offerer_token_account_info.try_borrow_data()?[..]);

    match offerer_token_account_data {
      Ok(token_account) => {
        if token_account.owner != *offerer.key || token_account.mint != *mint_info.key {
          return Err(error!(CustomError::InvalidRemainingAccounts));
        }
      },
      Err(_) => {
        let offerer_token_account = get_associated_token_address(
          offerer.key,
          mint_info.key,
        );
    
        if *offerer_token_account_info.key != offerer_token_account {
          return Err(error!(CustomError::InvalidRemainingAccounts));
        }
    
        invoke(
          &create_associated_token_account(
            offeree.key,
            offerer.key,
            mint_info.key
          ),
          &[
            offeree.to_account_info(),
            offeree_token_account_info.clone(),
            offerer.to_account_info(),
            mint_info.clone(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
          ],
        )?;
      }
    };
    
    let transfer_ix = spl_token::instruction::transfer(
      &TOKEN_PROGRAM_ID,
      offeree_token_account_info.key,
      offerer_token_account_info.key,
      &offeree.key(),
      &[],
      request.amount // Must be 1 for nfts. For tokens can be anything > 0
    )?;

    invoke(
      &transfer_ix,
      &[
        offeree_token_account_info.clone(),
        offerer_token_account_info.clone(),
        offeree.to_account_info(),
      ]
    )?;

    i += 3;
  }

  match escrow_account.lamports_requesting {
    Some(amount) => {
      invoke(
        &solana_program::system_instruction::transfer(
          offeree.key,
          offerer.key,
          amount,
        ),
        &[
          offeree.to_account_info(),
          offerer.to_account_info(),
        ]
      )?;
    },
    None => {},
  };

  for offering in escrow_account.tokens_offering.clone() {
    let mint_info = ctx.remaining_accounts.get(i).ok_or(CustomError::InvalidRemainingAccounts)?;
    let offeree_token_account_info = ctx.remaining_accounts.get(i+1).ok_or(CustomError::InvalidRemainingAccounts)?;
    let escrow_token_account_info = ctx.remaining_accounts.get(i+2).ok_or(CustomError::InvalidRemainingAccounts)?;

    if *mint_info.key != offering.mint.ok_or(CustomError::MissingOfferingMint)? {
      return Err(error!(CustomError::InvalidRemainingAccounts));
    }

    let offeree_token_account_data = TokenAccount::try_deserialize(&mut &offeree_token_account_info.try_borrow_data()?[..]);

    match offeree_token_account_data {
      Ok(token_account) => {
        if token_account.owner != *offeree.key || token_account.mint != *mint_info.key {
          return Err(error!(CustomError::InvalidRemainingAccounts));
        }
      },
      Err(_) => {
        let offeree_token_account = get_associated_token_address(
          offeree.key,
          mint_info.key,
        );
    
        if *offeree_token_account_info.key != offeree_token_account {
          return Err(error!(CustomError::InvalidRemainingAccounts));
        }
    
        invoke(
          &create_associated_token_account(
            offeree.key,
            offeree.key,
            mint_info.key
          ),
          &[
            offeree.to_account_info(),
            offeree_token_account_info.clone(),
            offeree.to_account_info(),
            mint_info.clone(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            ctx.accounts.rent.to_account_info(),
          ],
        )?;
      }
    };

    let (escrow_token_account, _bump) = Pubkey::find_program_address(
      &[
        b"token-account".as_ref(),
        escrow_account.key().as_ref(),
        mint_info.key.as_ref(),
      ],
      ctx.program_id,
    );

    if *escrow_token_account_info.key != escrow_token_account {
      return Err(error!(CustomError::InvalidRemainingAccounts));
    }

    let transfer_ix = spl_token::instruction::transfer(
      &TOKEN_PROGRAM_ID,
      &escrow_token_account,
      offeree_token_account_info.key,
      &escrow_account.key(),
      &[],
      offering.amount // Must be 1 for nfts. For tokens can be anything > 0
    )?;

    invoke_signed(
      &transfer_ix,
      &[
        offeree_token_account_info.clone(),
        escrow_token_account_info.clone(),
        offerer.to_account_info(),
      ],
      &[
        &[
          b"trade-escrow".as_ref(),
          ctx.accounts.global_state.key().as_ref(),
          offerer.key.as_ref(),
          &escrow_account.nonce.to_le_bytes(),
          &[escrow_bump],
        ]
      ]
    )?;

    let close_ix = close_account(
      &TOKEN_PROGRAM_ID,
      &escrow_token_account,
      offerer.key,
      &escrow_account.key(),
      &[]
    )?;

    invoke_signed(
      &close_ix,
      &[
        escrow_token_account_info.clone(),
        offerer.to_account_info(),
        escrow_account.to_account_info(),
      ],
      &[
        &[
          b"trade-escrow".as_ref(),
          ctx.accounts.global_state.key().as_ref(),
          offerer.key.as_ref(),
          &escrow_account.nonce.to_le_bytes(),
          &[escrow_bump],
        ]
      ]
    )?;

    i += 3;
  }

  match escrow_account.lamports_offering {
    Some(amount) => {
      transfer_from_program_owned_account(
        &mut escrow_account.to_account_info(),
        &mut offeree.to_account_info(),
        amount,
      )?;
    },
    None => {},
  };

  ctx.accounts.global_state.pending_offers -= 1;
  ctx.accounts.global_state.completed_trades += 1;

  Ok(())
}