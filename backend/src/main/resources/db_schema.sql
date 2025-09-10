-- SQL Script to create tables for Cosplay Suggestion App
-- Database: CosplaySuggestion
-- Server: SQL Server

USE CosplaySuggestion;

-- Create accounts table
CREATE TABLE accounts (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    birth_day DATE,
    username NVARCHAR(50) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    height FLOAT,
    weight FLOAT,
    gender NVARCHAR(10) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    avatar NVARCHAR(500),
    is_active BIT NOT NULL DEFAULT 1,
    role NVARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'CUSTOMER')) DEFAULT 'CUSTOMER',
    provider NVARCHAR(20) NOT NULL CHECK (provider IN ('LOCAL', 'GOOGLE')) DEFAULT 'LOCAL',
    provider_id NVARCHAR(100),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE()
);

-- Create indexes for better performance
CREATE INDEX IX_accounts_username ON accounts(username);
CREATE INDEX IX_accounts_email ON accounts(email);
CREATE INDEX IX_accounts_role ON accounts(role);
CREATE INDEX IX_accounts_provider ON accounts(provider);
CREATE INDEX IX_accounts_is_active ON accounts(is_active);
CREATE INDEX IX_accounts_provider_provider_id ON accounts(provider, provider_id);

-- Insert default admin account
INSERT INTO accounts (full_name, username, password, email, role, provider, is_active) 
VALUES ('Administrator', 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@cosplaysuggestion.com', 'ADMIN', 'LOCAL', 1);

-- Create email verification tokens table
CREATE TABLE email_verification_tokens (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    token NVARCHAR(255) NOT NULL UNIQUE,
    account_id BIGINT NOT NULL,
    expiry_date DATETIME2 NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    last_sent_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Create indexes for email verification tokens
CREATE INDEX IX_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IX_email_verification_tokens_account_id ON email_verification_tokens(account_id);
CREATE INDEX IX_email_verification_tokens_expiry_date ON email_verification_tokens(expiry_date);

-- Create password reset tokens table
CREATE TABLE password_reset_tokens (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    code NVARCHAR(6) NOT NULL,
    account_id BIGINT NOT NULL,
    expiry_date DATETIME2 NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    used BIT NOT NULL DEFAULT 0,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);

-- Create indexes for password reset tokens
CREATE INDEX IX_password_reset_tokens_code ON password_reset_tokens(code);
CREATE INDEX IX_password_reset_tokens_account_id ON password_reset_tokens(account_id);
CREATE INDEX IX_password_reset_tokens_expiry_date ON password_reset_tokens(expiry_date);
CREATE INDEX IX_password_reset_tokens_used ON password_reset_tokens(used);

-- Note: The password above is hashed version of 'password' using BCrypt
-- In production, make sure to use a strong password and proper hashing
