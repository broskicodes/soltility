pub mod context;
pub mod processor;
pub mod error;
pub mod state;

use {
  anchor_lang::prelude::*,
  crate::context::*,
  crate::processor::*,
  crate::state::*,
};

declare_id!("EMihg7zqtS6aWKc6K4qRKsjAPJbfhnJpGLakjgb3xvvP");

#[program]
pub mod p2p_trading {
  use super::*;
}