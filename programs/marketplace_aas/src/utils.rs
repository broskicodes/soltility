use {
  anchor_lang::prelude::*,
};

pub const ONE_DAY: u64 = 60 * 60 * 24;

pub fn transfer_from_program_owned_account(
  src: &mut AccountInfo,
  dst: &mut AccountInfo,
  amount: u64,
) -> Result<()> {
  **src.try_borrow_mut_lamports()? = src
    .lamports()
    .checked_sub(amount)
    .ok_or(ProgramError::InvalidArgument)?;
    
  **dst.try_borrow_mut_lamports()? = dst
    .lamports()
    .checked_add(amount)
    .ok_or(ProgramError::InvalidArgument)?;

  Ok(())
}