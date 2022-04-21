use {
  anchor_lang::prelude::*,
  crate::context::InitializeOrganization,
  crate::error::CustomError,
};

pub fn process(
  ctx: Context<InitializeOrganization>,
  name: String,
  custom_vault: Option<Pubkey>,
) -> Result<()> {
  let organization = &mut ctx.accounts.organization;

  match custom_vault {
    Some(key) => {
      let vault = ctx.remaining_accounts.get(0).ok_or(CustomError::MissingAccountInfo)?.clone();

      if key != *vault.key {
        return Err(error!(CustomError::InvalidAccountInfo));
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