use {
  anchor_lang::prelude::*,
  crate::context::ListNft,
  crate::state::*,
  crate::error::*,
  solana_program::{
    entrypoint::ProgramResult,
    program::invoke,
  },
  spl_token::instruction::transfer,
  mpl_token_metadata::{
    state::Metadata,
  },
};

pub fn process_list_nft(
  ctx: Context<ListNft>,
  price: u64,
) -> ProgramResult {
  let escrow_account = &mut ctx.accounts.escrow_account;
  let collection = &mut ctx.accounts.collection;

  if escrow_account.active {
    return Err(ProgramError::from(MarketplaceError::NftListed));
  }

  let metadata = Metadata::from_account_info(&ctx.accounts.nft_metadata_account.to_account_info())?;

  let nft_collection_address = match collection.version {
    CandyMachineVersion::V1 => {
      let candy_machine = metadata.data.creators.unwrap()[0].clone();
      if !candy_machine.verified {
        return Err(ProgramError::from(MarketplaceError::InvalidCollection));
      }
      candy_machine.address
    },
    CandyMachineVersion::V2 => {
      let collection = metadata.collection.unwrap().clone();
      if !collection.verified {
        return Err(ProgramError::from(MarketplaceError::InvalidCollection));
      }
      collection.key
    }
  };

  if collection.collection_id != nft_collection_address {
    return Err(ProgramError::from(MarketplaceError::InvalidCollection));
  }

  let ix = transfer(
    ctx.accounts.token_program.key,
    &ctx.accounts.seller_nft_token_account.key(),
    &ctx.accounts.escrow_token_account.key(),
    ctx.accounts.seller.key,
    &[ctx.accounts.seller.key],
    1,
  )?;

  invoke(
    &ix,
    &[
      ctx.accounts.seller.to_account_info(),
      ctx.accounts.escrow_token_account.to_account_info(),
      ctx.accounts.seller_nft_token_account.to_account_info(),
    ],
  )?;
  
  escrow_account.collection = collection.key();
  escrow_account.seller = ctx.accounts.seller.key();
  escrow_account.mint = ctx.accounts.nft_mint.key();
  escrow_account.token_account = ctx.accounts.escrow_token_account.key();
  escrow_account.price = price;
  escrow_account.active = true;

  Ok(())
}