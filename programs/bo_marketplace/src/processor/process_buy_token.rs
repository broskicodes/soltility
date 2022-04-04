use {
  anchor_lang::{
    prelude::*,
    AccountsClose,
  },
  crate::context::BuyToken,
  crate::error::*,
  crate::utils::transfer_from_program_owned_account,
  solana_program::{
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

pub fn process_buy_token<'a, 'b, 'c, 'info>(
  ctx: Context<'a, 'b, 'c, 'info, BuyToken<'info>>,
  escrow_nonce: u8,
  amount: u64,
) -> Result<()> {
  let escrow_account = &mut ctx.accounts.escrow_account;

  if escrow_account.seller != *ctx.accounts.seller.key {
    return Err(error!(MarketplaceError::UnknownSeller));
  }

  let total_price = escrow_account.price_per_token * (amount / 10u64.pow(ctx.accounts.token_mint.decimals as u32));
  msg!("{:?}", total_price);
  let buyer_pay_ix = solana_program::system_instruction::transfer(
    ctx.accounts.buyer.key,
    &ctx.accounts.marketplace_vault.key(),
    total_price,
  );

  invoke(
    &buyer_pay_ix,
    &[
      ctx.accounts.buyer.to_account_info(),
      ctx.accounts.marketplace_vault.to_account_info(),
    ]
  )?;

  let payout_amount = total_price - (total_price / 10000 * ctx.accounts.marketplace.fee as u64);
  let _metadata = Metadata::from_account_info(&ctx.accounts.metadata_account.to_account_info())?;
  // let creators_share = payout_amount / 10000 * metadata.data.seller_fee_basis_points as u64;

  // if creators_share > 0 {
  //   match metadata.data.creators {
  //     Some(creators) => {
  //       let mut i: usize = 0;
  //       for creator in creators.iter() {
  //         if creator.share > 0 {
  //           let to_account = (ctx.remaining_accounts.get(i).ok_or(error!(MarketplaceError::BadCreatorInfo))?).clone();

  //           invoke_signed(
  //             &solana_program::system_instruction::transfer(
  //               &ctx.accounts.marketplace_vault.key(),
  //               &creator.address,
  //               creators_share / 100 * creator.share as u64,
  //             ),
  //             &[
  //               ctx.accounts.marketplace_vault.to_account_info(),
  //               to_account,
  //             ],
  //             &[
  //               &[
  //                 b"marketplace-vault".as_ref(),
  //                 ctx.accounts.marketplace.key().as_ref(),
  //                 &[vault_nonce]
  //               ]
  //             ]
  //           )?;

  //           i += 1;
  //         }
  //       }
  //     },
  //     None => {}
  //   };
  // }

  transfer_from_program_owned_account(
    &mut ctx.accounts.marketplace_vault.to_account_info(),
    &mut ctx.accounts.seller.to_account_info(),
    payout_amount,
  )?;

  let spl_transfer_ix = spl_token::instruction::transfer(
    ctx.accounts.token_program.key,
    &ctx.accounts.escrow_token_account.key(),
    &ctx.accounts.buyer_token_account.key(),
    &ctx.accounts.escrow_account.key(),
    &[],
    amount,
  )?;

  invoke_signed(
    &spl_transfer_ix,
    &[
      ctx.accounts.escrow_account.to_account_info(),
      ctx.accounts.escrow_token_account.to_account_info(),
      ctx.accounts.buyer_token_account.to_account_info(),
    ],
    &[
      &[
        b"escrow".as_ref(),
        ctx.accounts.marketplace.key().as_ref(),
        ctx.accounts.metadata_account.key().as_ref(),
        ctx.accounts.token_mint.key().as_ref(),
        ctx.accounts.seller.key().as_ref(),
        &[escrow_nonce],
      ],
    ],
  )?;

  if ctx.accounts.escrow_token_account.amount - amount == 0 {
    let mut close_ix = close_account(
      ctx.accounts.token_program.key,
      &ctx.accounts.escrow_token_account.key(),
      &ctx.accounts.seller.key(),
      &ctx.accounts.escrow_account.key(),
      &[],
    )?;

    // Ridiculous hack to fix "sum of account balances before and 
    // after instruction do not match" error
    close_ix.accounts.push(AccountMeta {
      pubkey: *ctx.accounts.marketplace_vault.key,
      is_signer: false,
      is_writable: false,
    });

    invoke_signed(
      &close_ix,
      &[
        ctx.accounts.escrow_account.to_account_info(),
        ctx.accounts.escrow_token_account.to_account_info(),
        ctx.accounts.seller.to_account_info(),
        ctx.accounts.marketplace_vault.to_account_info(),
      ],
      &[
        &[
          b"escrow".as_ref(),
          ctx.accounts.marketplace.key().as_ref(),
          ctx.accounts.metadata_account.key().as_ref(),
          ctx.accounts.token_mint.key().as_ref(),
          ctx.accounts.seller.key().as_ref(),
          &[escrow_nonce],
        ],
      ],
    )?;

    ctx.accounts.escrow_account.close(ctx.accounts.seller.to_account_info())?;
  }

  Ok(())
}