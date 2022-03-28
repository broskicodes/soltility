use {
  anchor_lang::prelude::*,
  crate::context::BuyNft,
  crate::error::*,
  solana_program::{
    entrypoint::ProgramResult,
    program::{
      invoke_signed,
      invoke,
    },
  },
  spl_token::instruction::{
    close_account,
  },
  mpl_token_metadata::{
    state::{
      Metadata,
    },
  },
};

pub fn process_buy_nft<'a, 'b, 'c, 'info>(
  ctx: Context<'a, 'b, 'c, 'info, BuyNft<'info>>,
  escrow_nonce: u8,
  vault_nonce: u8,
) -> ProgramResult {
  let escrow_account = &mut ctx.accounts.escrow_account;

  if !escrow_account.active {
    return Err(ProgramError::from(MarketplaceError::NftUnlisted));
  }

  if escrow_account.seller != *ctx.accounts.seller.key {
    return Err(ProgramError::from(MarketplaceError::UnknownSeller));
  }

  let buyer_pay_ix = solana_program::system_instruction::transfer(
    ctx.accounts.buyer.key,
    &ctx.accounts.marketplace_vault.key(),
    escrow_account.price
  );

  invoke(
    &buyer_pay_ix,
    &[
      ctx.accounts.buyer.to_account_info(),
      ctx.accounts.marketplace_vault.to_account_info(),
    ]
  )?;

  let payout_amount = escrow_account.price - (escrow_account.price / 100 * ctx.accounts.marketplace.fee as u64);
  let metadata = Metadata::from_account_info(&ctx.accounts.nft_metadata_account.to_account_info())?;
  let creators_share = payout_amount / 10000 * metadata.data.seller_fee_basis_points as u64;

  if creators_share > 0 {
    match metadata.data.creators {
      Some(creators) => {
        let mut i: usize = 0;
        for creator in creators.iter() {
          if creator.share > 0 {
            let to_account = (ctx.remaining_accounts.get(i).ok_or(ProgramError::from(MarketplaceError::BadCreatorInfo))?).clone();

            invoke_signed(
              &solana_program::system_instruction::transfer(
                &ctx.accounts.marketplace_vault.key(),
                &creator.address,
                creators_share / 100 * creator.share as u64,
              ),
              &[
                ctx.accounts.marketplace_vault.to_account_info(),
                to_account,
              ],
              &[
                &[
                  b"marketplace-vault".as_ref(),
                  ctx.accounts.marketplace.key().as_ref(),
                  &[vault_nonce]
                ]
              ]
            )?;

            i += 1;
          }
        }
        // return Ok(());
      },
      None => { 
        // return Ok(()); 
      }
    };
  }

  let seller_receive_ix = solana_program::system_instruction::transfer(
    &ctx.accounts.marketplace_vault.key(),
    ctx.accounts.seller.key,
    payout_amount - creators_share,
  );

  invoke_signed(
    &seller_receive_ix,
    &[
      ctx.accounts.marketplace_vault.to_account_info(),
      ctx.accounts.seller.to_account_info(),
    ],
    &[
      &[
        b"marketplace-vault".as_ref(),
        ctx.accounts.marketplace.key().as_ref(),
        &[vault_nonce]
      ]
    ]
  )?;

  let spl_transfer_ix = spl_token::instruction::transfer(
    ctx.accounts.token_program.key,
    &ctx.accounts.escrow_token_account.key(),
    &ctx.accounts.buyer_nft_token_account.key(),
    &ctx.accounts.escrow_account.key(),
    &[],
    1,
  )?;

  invoke_signed(
    &spl_transfer_ix,
    &[
      ctx.accounts.escrow_account.to_account_info(),
      ctx.accounts.escrow_token_account.to_account_info(),
      ctx.accounts.buyer_nft_token_account.to_account_info(),
    ],
    &[
      &[
        b"escrow".as_ref(),
        ctx.accounts.marketplace.key().as_ref(),
        ctx.accounts.collection.key().as_ref(),
        ctx.accounts.nft_mint.key().as_ref(),
        ctx.accounts.seller.key().as_ref(),
        &[escrow_nonce],
      ],
    ],
  )?;

  let close_ix = close_account(
    ctx.accounts.token_program.key,
    &ctx.accounts.escrow_token_account.key(),
    &ctx.accounts.seller.key(),
    &ctx.accounts.escrow_account.key(),
    &[],
  )?;

  invoke_signed(
    &close_ix,
    &[
      ctx.accounts.escrow_account.to_account_info(),
      ctx.accounts.escrow_token_account.to_account_info(),
      ctx.accounts.seller.to_account_info(),
    ],
    &[
      &[
        b"escrow".as_ref(),
        ctx.accounts.marketplace.key().as_ref(),
        ctx.accounts.collection.key().as_ref(),
        ctx.accounts.nft_mint.key().as_ref(),
        ctx.accounts.seller.key().as_ref(),
        &[escrow_nonce],
      ],
    ],
  )?;

  Ok(())
}