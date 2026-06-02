-- Insert superuser with proper bcrypt hash
-- Password: yousef22
-- Hash: $2a$12$N2h0nepXsd6czV5tAj6xQOWb0eMmWS94EUnpDlpgD6jplfPzbz8/.

USE smart_access_system;
GO

-- Delete existing record if any
DELETE FROM dbo.users WHERE email = 'yousef22@gmail.com';
GO

-- Insert the superuser
INSERT INTO dbo.users (name, email, role, status, password, password_hash, created_at)
VALUES (
    'Yousef Superuser',
    'yousef22@gmail.com',
    'admin',
    'allowed',
    '',
    '$2a$12$N2h0nepXsd6czV5tAj6xQOWb0eMmWS94EUnpDlpgD6jplfPzbz8/.',
    GETDATE()
);
GO

-- Verify the insertion
SELECT id, name, email, role, status, 
       CAST(password_hash AS NVARCHAR(MAX)) as password_hash,
       DATALENGTH(password_hash) as hash_length
FROM dbo.users 
WHERE email = 'yousef22@gmail.com';
GO