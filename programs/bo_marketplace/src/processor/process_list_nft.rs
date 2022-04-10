use {
  anchor_lang::prelude::*,
  crate::context::ListNft,
  crate::state::*,
  crate::error::*,
  solana_program::{
    program::invoke,
  },
  spl_token::instruction::transfer,
  mpl_token_metadata::{
    state::Metadata,
  },
};

pub fn process_list_nft(
  ctx: Context<ListNft>,
  token_type: TokenType,
  price: u64,
) -> Result<()> {
  let escrow_account = &mut ctx.accounts.escrow_account;
  let collection = &mut ctx.accounts.collection;

  let metadata = Metadata::from_account_info(&ctx.accounts.nft_metadata_account.to_account_info())?;

  match token_type {
    TokenType::NonFungible => Ok(()),
    _ => Err(error!(MarketplaceError::WrongMarketplace))
  }?;

  let nft_collection_address = match collection.version {
    CandyMachineVersion::V1 => {
      let candy_machine = &(metadata.data.creators.ok_or(MarketplaceError::InvalidCollectionId)?)[0];
      if !candy_machine.verified {
        return Err(error!(MarketplaceError::MismatchedNft));
      }
      candy_machine.address
    },
    CandyMachineVersion::V2 => {
      let collection = metadata.collection.ok_or(MarketplaceError::InvalidCollectionId)?;
      if !collection.verified {
        return Err(error!(MarketplaceError::MismatchedNft));
      }
      collection.key
    }
  };

  if collection.collection_id != nft_collection_address {
    return Err(error!(MarketplaceError::MismatchedNft));
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
  
  escrow_account.collection = Some(collection.key());
  escrow_account.seller = ctx.accounts.seller.key();
  escrow_account.mint = ctx.accounts.nft_mint.key();
  escrow_account.token_account = ctx.accounts.escrow_token_account.key();
  escrow_account.price_per_token = price;
  escrow_account.token_type = TokenType::NonFungible;
  escrow_account.marketplace = ctx.accounts.marketplace.key();

  Ok(())
}