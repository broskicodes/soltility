use {
  anchor_lang::prelude::*,
  crate::context::RegisterStandardCollection,
  crate::state::*,
  crate::error::*,
  mpl_token_metadata::state::Metadata,
};

pub fn process(
  ctx: Context<RegisterStandardCollection>,
  version: CandyMachineVersion,
  name: String,
) -> Result<()> {
  let collection = &mut ctx.accounts.collection;
  let collection_id = &mut ctx.accounts.collection_id;

  // Verify collection name?
  let metadata = Metadata::from_account_info(&ctx.accounts.metadata_account.to_account_info())?;

  let passed_collection_key = match version {
    CandyMachineVersion::V1 => {
      let candy_machine = &(metadata.data.creators.ok_or(MarketplaceError::InvalidCollectionId)?)[0];
      if !candy_machine.verified {
        return Err(error!(MarketplaceError::InvalidCollectionId));
      }
      candy_machine.address
    },
    CandyMachineVersion::V2 => {
      let collection_data = metadata.collection.ok_or(MarketplaceError::InvalidCollectionId)?;
      if !collection_data.verified{
        return Err(error!(MarketplaceError::InvalidCollectionId));
      }
      collection_data.key
    }
  };

  if collection_id.key() != passed_collection_key {
    return Err(error!(MarketplaceError::InvalidCollectionId));
  }
      
  collection.version = version;
  collection.name = name;
  collection.collection_id = *ctx.accounts.collection_id.key;

  Ok(())
}