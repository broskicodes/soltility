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
  #[msg("Invalid fee, must be in basis points.")]
  InvalidFee,
  #[msg("Attempting to list token/nft on incorrect marketplace.")]
  WrongMarketplace,
  #[msg("Missing required account account info to execute instruction.")]
  MissingAccountInfo,
  #[msg("Passed vault account info does not match key argument passed to instruction.")]
  InvalidAccountInfo,
  #[msg("Signing organization authority does not match authority on record.")]
  IncorrectOrgAuthority,
  #[msg("A bump required for instruction processing is missing.")]
  MissingBump,
}

#[error_code]
pub enum TradeError {
  #[msg("Provided escrow nonce does not match expected value.")]
  MismatchedEscrowNonce,
  #[msg("Passed remaining accounts array does not contain the expected accounts.")]
  InvalidRemainingAccounts,
  #[msg("Missing a required mint key in offering.")]
  MissingOfferingMint,
  #[msg("Signer key does not match the offerer stored in account.")]
  InvalidOfferer,
  #[msg("Signer key does not match the offeree stored in account.")]
  InvalidOfferee,
}