-- Migration: Add email preferences to user_profiles
-- This allows users to control which emails they receive

-- Add email notification preferences
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_budget_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_daily_tips BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_savings_alerts BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_achievements BOOLEAN DEFAULT true;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_email_notifications 
ON user_profiles(email_notifications_enabled) 
WHERE email_notifications_enabled = true;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.email_notifications_enabled IS 'Global toggle for all email notifications';
COMMENT ON COLUMN user_profiles.email_budget_alerts IS 'Receive emails when budget is exceeded or close to limit';
COMMENT ON COLUMN user_profiles.email_daily_tips IS 'Receive daily financial tips via email';
COMMENT ON COLUMN user_profiles.email_savings_alerts IS 'Receive emails about savings status';
COMMENT ON COLUMN user_profiles.email_achievements IS 'Receive emails for achievements and milestones';

