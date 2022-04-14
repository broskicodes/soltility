use {
  anchor_lang::prelude::*,
  crate::context::staking_context::StakeNft,
  crate::state::*,
  crate::error::*,
  mpl_token_metadata::state::Metadata,
  spl_token::instruction::transfer,
  solana_program::program::invoke,
};

pub fn process(
  ctx: Context<StakeNft>,
) -> Result<()> {
  let collection = &ctx.accounts.collection;
  let escrow_account = &mut ctx.accounts.escrow_account;

  let metadata = Metadata::from_account_info(&ctx.accounts.nft_metadata_account.to_account_info())?;

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
    &ctx.accounts.user_nft_token_account.key(),
    &ctx.accounts.escrow_token_account.key(),
    ctx.accounts.user.key,
    &[],
    1,
  )?;

  invoke(
    &ix,
    &[
      ctx.accounts.user.to_account_info(),
      ctx.accounts.escrow_token_account.to_account_info(),
      ctx.accounts.user_nft_token_account.to_account_info(),
    ],
  )?;

  escrow_account.stake_vault = ctx.accounts.stake_vault.key();
  escrow_account.user = *ctx.accounts.user.key;
  escrow_account.nft_mint = ctx.accounts.nft_mint.key();
  escrow_account.daily_rate = ctx.accounts.stake_vault.daily_rate;
  escrow_account.start_date = ctx.accounts.clock.unix_timestamp;
  escrow_account.last_claimed_date = ctx.accounts.clock.unix_timestamp;

  Ok(())
}