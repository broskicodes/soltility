use {
  anchor_lang::prelude::*,
  crate::context::InitializeOrganization,
  crate::error::MarketplaceError,
};

pub fn process_initialize_organization(
  ctx: Context<InitializeOrganization>,
  name: String,
  custom_vault: Option<Pubkey>,
) -> Result<()> {
  let organization = &mut ctx.accounts.organization;

  match custom_vault {
    Some(key) => {
      let vault = ctx.remaining_accounts.get(0).ok_or(MarketplaceError::MissingAccountInfo)?.clone();

      if key != *vault.key {
        return Err(error!(MarketplaceError::InvalidAccountInfo));
      }

      if !vault.is_signer {
        return Err(ProgramError::MissingRequiredSignature.into());
      }

      organization.custom_vault = Some(key);
    },
    None => organization.custom_vault = None
  };

  organization.authority = *ctx.accounts.authority.key;
  organization.name = name;

  Ok(())
}