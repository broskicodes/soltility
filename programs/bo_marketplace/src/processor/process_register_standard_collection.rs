use {
  anchor_lang::prelude::*,
  crate::context::RegisterStandardCollection,
  crate::state::*,
  crate::error::*,
  solana_program::{
    entrypoint::ProgramResult,
  },
};

pub fn process_register_standard_collection(
  ctx: Context<RegisterStandardCollection>,
  version: CandyMachineVersion,
  name: String,
  size: u32,
  hash_list_link: Option<String>,
) -> ProgramResult {
  let collection = &mut ctx.accounts.collection;

  // Verify that the collection ID actually exists and is what it should be?
  // Verify collection size and name
      
  collection.hash_list_link = hash_list_link;
  collection.version = version;
  collection.name = name;
  collection.size = size;
  collection.collection_id = *ctx.accounts.collection_id.key;

  Ok(())
}