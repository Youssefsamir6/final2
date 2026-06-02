-- Create superuser for Smart Access System
USE smart_access_system;

-- Password hash from original account
DECLARE @passwordHash NVARCHAR(255) = '$2a$12$akD0BZJ8QMvALlCfmlw2JONnXQN4d071gPHkMcBGbg684SAyJ/1xa';

-- Check if user already exists
IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'youssefvenom66@gmail.com')
BEGIN
    INSERT INTO users (name, email, password_hash, role, status, created_at)
    VALUES ('Youssef', 'youssefvenom66@gmail.com', @passwordHash, 'admin', 'allowed', GETDATE());
    
    PRINT 'Superuser created successfully!';
    PRINT 'Email: youssefvenom66@gmail.com';
    PRINT 'Password: SmartAccess123!';
    PRINT 'Role: admin';
END
ELSE
BEGIN
    PRINT 'User already exists. Updating password hash...';
    UPDATE users 
    SET password_hash = @passwordHash,
        role = 'admin',
        status = 'allowed'
    WHERE email = 'youssefvenom66@gmail.com';
    PRINT 'User updated successfully!';
END

-- Verify user was created/updated
SELECT id, name, email, role, status, created_at FROM users WHERE email = 'youssefvenom66@gmail.com';
