use anchor_lang::prelude::*;

declare_id!("5g5vVtid5C6rVfshSQMHpWy7rvWWXrowVUN78UCKkQEj");

#[program]
pub mod agent_reputation {
    use super::*;

    /// Original registration (no stake required)
    pub fn initialize_agent(
        ctx: Context<InitializeAgent>,
        role: AgentRole,
    ) -> Result<()> {
        let reputation = &mut ctx.accounts.reputation;
        let timestamp = Clock::get()?.unix_timestamp;

        reputation.agent = ctx.accounts.agent.key();
        reputation.role = role;
        reputation.jobs_completed = 0;
        reputation.jobs_failed = 0;
        reputation.total_earned = 0;
        reputation.trust_score = 50;
        reputation.created_at = timestamp;
        reputation.last_updated = timestamp;

        Ok(())
    }

    /// NEW: Registration with stake
    pub fn initialize_agent_with_stake(
        ctx: Context<InitializeAgentWithStake>,
        role: AgentRole,
        stake_amount: u64,
    ) -> Result<()> {
        // Initialize reputation (same as above)
        let reputation = &mut ctx.accounts.reputation;
        let timestamp = Clock::get()?.unix_timestamp;

        reputation.agent = ctx.accounts.agent.key();
        reputation.role = role;
        reputation.jobs_completed = 0;
        reputation.jobs_failed = 0;
        reputation.total_earned = 0;
        reputation.trust_score = 50;
        reputation.created_at = timestamp;
        reputation.last_updated = timestamp;

        // Transfer stake to stake PDA
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.payer.to_account_info(),
                to: ctx.accounts.stake_pda.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, stake_amount)?;

        Ok(())
    }

    /// Update reputation (unchanged)
    pub fn update_reputation(
        ctx: Context<UpdateReputation>,
        success: bool,
        amount_earned: u64,
    ) -> Result<()> {
        let reputation = &mut ctx.accounts.reputation;

        if success {
            reputation.jobs_completed += 1;
            reputation.total_earned += amount_earned;
        } else {
            reputation.jobs_failed += 1;
        }

        let total = reputation.jobs_completed + reputation.jobs_failed;
        if total > 0 {
            reputation.trust_score =
                ((reputation.jobs_completed * 100) / total) as u8;
        }

        reputation.last_updated = Clock::get()?.unix_timestamp;
        Ok(())
    }

    /// NEW: Slash stake for bad behavior
    pub fn slash_stake(
        ctx: Context<SlashStake>,
        slash_amount: u64,
    ) -> Result<()> {
        // Reduce agent's stake by moving lamports out
        **ctx.accounts.stake_pda.to_account_info().try_borrow_mut_lamports()? -= slash_amount;
        **ctx.accounts.authority.to_account_info().try_borrow_mut_lamports()? += slash_amount;
        
        Ok(())
    }

    /// NEW: Withdraw stake (for good agents)
    pub fn withdraw_stake(
        ctx: Context<WithdrawStake>,
        withdraw_amount: u64,
    ) -> Result<()> {
        // Allow agent to withdraw their stake
        **ctx.accounts.stake_pda.to_account_info().try_borrow_mut_lamports()? -= withdraw_amount;
        **ctx.accounts.agent.to_account_info().try_borrow_mut_lamports()? += withdraw_amount;
        
        Ok(())
    }
}

// ============================================================================
// ACCOUNTS
// ============================================================================

#[derive(Accounts)]
pub struct InitializeAgent<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + AgentReputation::INIT_SPACE,
        seeds = [b"reputation", agent.key().as_ref()],
        bump
    )]
    pub reputation: Account<'info, AgentReputation>,
    pub agent: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeAgentWithStake<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + AgentReputation::INIT_SPACE,
        seeds = [b"reputation", agent.key().as_ref()],
        bump
    )]
    pub reputation: Account<'info, AgentReputation>,
    
    /// Stake PDA - just holds lamports as collateral
    #[account(
        mut,
        seeds = [b"stake", agent.key().as_ref()],
        bump
    )]
    /// CHECK: PDA vault for stake collateral
    pub stake_pda: AccountInfo<'info>,
    
    pub agent: Signer<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateReputation<'info> {
    #[account(
        mut,
        seeds = [b"reputation", agent.key().as_ref()],
        bump
    )]
    pub reputation: Account<'info, AgentReputation>,
    
    /// CHECK: The agent whose reputation is being updated
    pub agent: UncheckedAccount<'info>,
    
    /// The orchestrator (authority) updating the reputation
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct SlashStake<'info> {
    #[account(
        mut,
        seeds = [b"stake", agent.key().as_ref()],
        bump
    )]
    /// CHECK: Stake PDA
    pub stake_pda: AccountInfo<'info>,
    
    /// CHECK: The agent being slashed
    pub agent: UncheckedAccount<'info>,
    
    /// Authority who can slash (orchestrator)
    #[account(mut)]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct WithdrawStake<'info> {
    #[account(
        mut,
        seeds = [b"stake", agent.key().as_ref()],
        bump
    )]
    /// CHECK: Stake PDA
    pub stake_pda: AccountInfo<'info>,
    
    /// Agent withdrawing their stake
    #[account(mut)]
    pub agent: Signer<'info>,
}

// ============================================================================
// DATA STRUCTURES
// ============================================================================

#[account]
#[derive(InitSpace)]
pub struct AgentReputation {
    pub agent: Pubkey,
    pub role: AgentRole,
    pub jobs_completed: u64,
    pub jobs_failed: u64,
    pub total_earned: u64,
    pub trust_score: u8,
    pub created_at: i64,
    pub last_updated: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, InitSpace)]
pub enum AgentRole {
    Scout,
    Evaluator,
    Negotiator,
    Supplier,
}