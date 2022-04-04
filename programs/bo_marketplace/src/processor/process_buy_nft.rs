use {
  anchor_lang::prelude::*,
  crate::context::BuyNft,
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

pub fn process_buy_nft<'a, 'b, 'c, 'info>(
  ctx: Context<'a, 'b, 'c, 'info, BuyNft<'info>>,
  escrow_nonce: u8,
) -> Result<()> {
  let escrow_account = &mut ctx.accounts.escrow_account;

  if escrow_account.seller != *ctx.accounts.seller.key {
    return Err(error!(MarketplaceError::UnknownSeller));
  }

  let buyer_pay_ix = solana_program::system_instruction::transfer(
    ctx.accounts.buyer.key,
    &ctx.accounts.marketplace_vault.key(),
    escrow_account.price_per_token
  );

  invoke(
    &buyer_pay_ix,
    &[
      ctx.accounts.buyer.to_account_info(),
      ctx.accounts.marketplace_vault.to_account_info(),
    ]
  )?;

  let payout_amount = escrow_account.price_per_token - (escrow_account.price_per_token / 10000 * ctx.accounts.marketplace.fee as u64);
  let metadata = Metadata::from_account_info(&ctx.accounts.nft_metadata_account.to_account_info())?;
  let creators_share = payout_amount / 10000 * metadata.data.seller_fee_basis_points as u64;

  let mut creator_infos: Vec<AccountInfo> = vec![];
  if creators_share > 0 {
    match metadata.data.creators {
      Some(creators) => {
        let mut i: usize = 0;
        for creator in creators.iter() {
          if creator.share > 0 {
            let to_account = (ctx.remaining_accounts.get(i).ok_or(error!(MarketplaceError::BadCreatorInfo))?).clone();
            creator_infos.push(to_account);

            transfer_from_program_owned_account(
              &mut ctx.accounts.marketplace_vault.to_account_info(),
              &mut creator_infos[i],
              creators_share / 100 * creator.share as u64,
            )?;

            i += 1;
          }
        }
      },
      None => {}
    };
  }

  transfer_from_program_owned_account(
    &mut ctx.accounts.marketplace_vault.to_account_info(),
    &mut ctx.accounts.seller.to_account_info(),
    payout_amount - creators_share,
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

  for info in creator_infos.clone() {
    close_ix.accounts.push(AccountMeta {
      pubkey: *info.key,
      is_signer: false,
      is_writable: false,
    });
  }

  invoke_signed(
    &close_ix,
    &[
      &[
        ctx.accounts.escrow_account.to_account_info(),
        ctx.accounts.escrow_token_account.to_account_info(),
        ctx.accounts.seller.to_account_info(),
        ctx.accounts.marketplace_vault.to_account_info(),
      ],
      // Continuation of hack
      creator_infos.as_slice(),
    ].concat(),
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