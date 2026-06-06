-- Migration: Add missing columns to users table for authentication support
-- Date: June 5, 2026
-- Purpose: Add email, password_hash, and idNumber columns required by the backend

USE [smart_access_system];
GO

-- Add email column if not exists
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[users]') 
    AND name = 'email'
)
BEGIN
    ALTER TABLE [dbo].[users] ADD [email] [nvarchar](255) NULL;
    PRINT 'Added email column to users table';
END
GO

-- Add password_hash column if not exists
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[users]') 
    AND name = 'password_hash'
)
BEGIN
    ALTER TABLE [dbo].[users] ADD [password_hash] [nvarchar](max) NULL;
    PRINT 'Added password_hash column to users table';
END
GO

-- Add idNumber column if not exists
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[users]') 
    AND name = 'idNumber'
)
BEGIN
    ALTER TABLE [dbo].[users] ADD [idNumber] [nvarchar](50) NULL;
    PRINT 'Added idNumber column to users table';
END
GO

-- Add updated_at column if not exists
IF NOT EXISTS (
    SELECT * FROM sys.columns 
    WHERE object_id = OBJECT_ID(N'[dbo].[users]') 
    AND name = 'updated_at'
)
BEGIN
    ALTER TABLE [dbo].[users] ADD [updated_at] [datetime] NULL;
    ALTER TABLE [dbo].[users] ADD DEFAULT (getdate()) FOR [updated_at];
    PRINT 'Added updated_at column to users table';
END
GO

-- Update the role constraint to allow more roles
-- First drop the existing constraint if it exists
DECLARE @constraintName NVARCHAR(128);
SELECT @constraintName = name 
FROM sys.check_constraints 
WHERE parent_object_id = OBJECT_ID(N'[dbo].[users]') 
AND type = 'C';

IF @constraintName IS NOT NULL
BEGIN
    DECLARE @sql NVARCHAR(500);
    SET @sql = N'ALTER TABLE [dbo].[users] DROP CONSTRAINT ' + QUOTENAME(@constraintName);
    EXEC sp_executesql @sql;
    PRINT 'Dropped existing role constraint: ' + @constraintName;
END
GO

-- Add new, more flexible role constraint
ALTER TABLE [dbo].[users] WITH CHECK ADD CONSTRAINT [CK_users_role] 
CHECK ([role]='staff' OR [role]='student' OR [role]='admin' OR [role]='guard' OR [role]='user' OR [role]='professor' OR [role]='assistant' OR [role]='worker' OR [role]='vip');
GO

PRINT 'Migration completed successfully!';
PRINT '';
PRINT 'New columns added to users table:';
PRINT '  - email (nvarchar(255))';
PRINT '  - password_hash (nvarchar(max))';
PRINT '  - idNumber (nvarchar(50))';
PRINT '  - updated_at (datetime)';
PRINT '';
PRINT 'Role constraint updated to allow: staff, student, admin, guard, user, professor, assistant, worker, vip';
GO