use anchor_lang::prelude::*;

declare_id!("EMihg7zqtS6aWKc6K4qRKsjAPJbfhnJpGLakjgb3xvvP");

#[program]
pub mod plop {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
