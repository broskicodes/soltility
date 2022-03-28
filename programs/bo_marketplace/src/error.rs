use {
  anchor_lang::prelude::*,
  solana_program::{
    program_error::{PrintProgramError, ProgramError},
  },
};

#[error_code]
pub enum MarketplaceError {
    #[msg("Hash List must be provided when using multiple Candy Machines in single collection.")]
    MissingHashList,
    #[msg("Nft already listed. Must delist first to update listing.")]
    NftListed,
    #[msg("Nft is already unlisted.")]
    NftUnlisted,
    #[msg("Person attempting to delist is not the one who originally listed.")]
    UnknownSeller,
    #[msg("Nft is not from the provided collection.")]
    InvalidCollection,
    #[msg("Passed Creator AccountInfo is missing or incorrect.")]
    BadCreatorInfo,
}

impl PrintProgramError for MarketplaceError {
  fn print<E>(&self) {
      msg!("MARKETPLACE-ERROR: {}", &self.to_string());
  }
}

impl From<MarketplaceError> for ProgramError {
  fn from(e: MarketplaceError) -> Self {
      ProgramError::Custom(e as u32)
  }
}