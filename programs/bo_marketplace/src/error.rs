use {
  anchor_lang::prelude::*,
};

#[error_code]
pub enum MarketplaceError {
  #[msg("Nft already listed. Must delist first to update listing.")]
  NftListed,
  #[msg("Nft not listed.")]
  NftUnlisted,
  #[msg("Nft is not part of the passed collection.")]
  MismatchedNft,
  #[msg("Person attempting to delist is not the one who originally listed.")]
  UnknownSeller,
  #[msg("Invalid collection id passed.")]
  InvalidCollectionId,
  #[msg("Passed Creator AccountInfo is missing or incorrect.")]
  BadCreatorInfo,
  #[msg("Invalid marketplace fee percentage.")]
  InvalidMarketplaceFee,
  #[msg("Attempting to list token/nft on incorrect marketplace.")]
  WrongMarketplace,
}