-- Create database with default paths
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'smart_access_system')
BEGIN
    CREATE DATABASE [smart_access_system];
END
GO

USE [smart_access_system];
GO

-- Create users table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[users](
        [id] [int] IDENTITY(1,1) NOT NULL,
        [name] [nvarchar](100) NOT NULL,
        [role] [nvarchar](50) NOT NULL,
        [status] [nvarchar](20) NULL,
        [created_at] [datetime] NULL,
        PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    ALTER TABLE [dbo].[users] ADD DEFAULT ('allowed') FOR [status];
    ALTER TABLE [dbo].[users] ADD DEFAULT (getdate()) FOR [created_at];
    ALTER TABLE [dbo].[users] WITH CHECK ADD CHECK ([role]='staff' OR [role]='student');
    ALTER TABLE [dbo].[users] WITH CHECK ADD CHECK ([status]='blocked' OR [status]='allowed');
END
GO

-- Create access_logs table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[access_logs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[access_logs](
        [id] [int] IDENTITY(1,1) NOT NULL,
        [user_id] [int] NULL,
        [status] [nvarchar](20) NULL,
        [access_time] [datetime] NULL,
        PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    ALTER TABLE [dbo].[access_logs] ADD DEFAULT (getdate()) FOR [access_time];
    ALTER TABLE [dbo].[access_logs] WITH CHECK ADD CHECK ([status]='denied' OR [status]='allowed');
    
    CREATE NONCLUSTERED INDEX [idx_user_logs] ON [dbo].[access_logs]([user_id] ASC);
    
    ALTER TABLE [dbo].[access_logs] WITH CHECK ADD FOREIGN KEY([user_id])
    REFERENCES [dbo].[users] ([id]) ON DELETE SET NULL;
END
GO

-- Create security_alerts table
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[security_alerts]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[security_alerts](
        [id] [int] IDENTITY(1,1) NOT NULL,
        [alert_type] [nvarchar](100) NOT NULL,
        [description] [nvarchar](max) NULL,
        [severity] [nvarchar](20) NULL,
        [user_id] [int] NULL,
        [created_at] [datetime] NULL,
        [status] [nvarchar](20) NULL,
        PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    ALTER TABLE [dbo].[security_alerts] ADD DEFAULT (getdate()) FOR [created_at];
    ALTER TABLE [dbo].[security_alerts] ADD DEFAULT ('Open') FOR [status];
    ALTER TABLE [dbo].[security_alerts] WITH CHECK ADD CHECK ([severity]='Critical' OR [severity]='High' OR [severity]='Medium' OR [severity]='Low');
    ALTER TABLE [dbo].[security_alerts] WITH CHECK ADD CHECK ([status]='Resolved' OR [status]='Open');
    
    ALTER TABLE [dbo].[security_alerts] WITH CHECK ADD FOREIGN KEY([user_id])
    REFERENCES [dbo].[users] ([id]);
END
GO

-- Create additional tables from original schema

-- face_images
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[face_images]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[face_images](
        [id] [int] IDENTITY(1,1) NOT NULL,
        [user_id] [int] NOT NULL,
        [image_path] [nvarchar](max) NOT NULL,
        [encoding] [nvarchar](max) NULL,
        [created_at] [datetime] NULL,
        PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    ALTER TABLE [dbo].[face_images] ADD DEFAULT (getdate()) FOR [created_at];
    ALTER TABLE [dbo].[face_images] WITH CHECK ADD FOREIGN KEY([user_id])
    REFERENCES [dbo].[users] ([id]) ON DELETE CASCADE;
END
GO

-- attendance
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[attendance]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[attendance](
        [id] [int] IDENTITY(1,1) NOT NULL,
        [user_id] [int] NOT NULL,
        [check_in] [datetime] NULL,
        [check_out] [datetime] NULL,
        PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    CREATE NONCLUSTERED INDEX [idx_user_attendance] ON [dbo].[attendance]([user_id] ASC);
    ALTER TABLE [dbo].[attendance] WITH CHECK ADD FOREIGN KEY([user_id])
    REFERENCES [dbo].[users] ([id]) ON DELETE CASCADE;
END
GO

-- blacklist
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[blacklist]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[blacklist](
        [id] [int] IDENTITY(1,1) NOT NULL,
        [user_id] [int] NULL,
        [name] [nvarchar](100) NULL,
        [reason] [nvarchar](255) NULL,
        [added_by] [int] NULL,
        [created_at] [datetime] NULL,
        PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    ALTER TABLE [dbo].[blacklist] ADD DEFAULT (getdate()) FOR [created_at];
    ALTER TABLE [dbo].[blacklist] WITH CHECK ADD FOREIGN KEY([added_by])
    REFERENCES [dbo].[users] ([id]);
    ALTER TABLE [dbo].[blacklist] WITH CHECK ADD FOREIGN KEY([user_id])
    REFERENCES [dbo].[users] ([id]);
END
GO

-- notifications
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[notifications]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[notifications](
        [id] [int] IDENTITY(1,1) NOT NULL,
        [user_id] [int] NULL,
        [title] [nvarchar](100) NOT NULL,
        [message] [nvarchar](255) NOT NULL,
        [type] [nvarchar](50) NULL,
        [is_read] [bit] NULL,
        [created_at] [datetime] NULL,
        PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    ALTER TABLE [dbo].[notifications] ADD DEFAULT ((0)) FOR [is_read];
    ALTER TABLE [dbo].[notifications] ADD DEFAULT (getdate()) FOR [created_at];
    ALTER TABLE [dbo].[notifications] WITH CHECK ADD CHECK ([type]='security' OR [type]='error' OR [type]='warning' OR [type]='info');
    ALTER TABLE [dbo].[notifications] WITH CHECK ADD FOREIGN KEY([user_id])
    REFERENCES [dbo].[users] ([id]) ON DELETE SET NULL;
END
GO

-- reject_reasons
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[reject_reasons]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[reject_reasons](
        [id] [int] IDENTITY(1,1) NOT NULL,
        [code] [nvarchar](50) NULL,
        [description] [nvarchar](255) NULL,
        PRIMARY KEY CLUSTERED ([id] ASC),
        UNIQUE NONCLUSTERED ([code] ASC)
    );
END
GO

-- rejected_logs
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[rejected_logs]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[rejected_logs](
        [id] [int] IDENTITY(1,1) NOT NULL,
        [user_id] [int] NULL,
        [name] [nvarchar](100) NULL,
        [reason] [nvarchar](255) NULL,
        [attempt_time] [datetime] NULL,
        [image_path] [nvarchar](max) NULL,
        [reason_id] [int] NULL,
        PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    ALTER TABLE [dbo].[rejected_logs] ADD DEFAULT (getdate()) FOR [attempt_time];
    ALTER TABLE [dbo].[rejected_logs] WITH CHECK ADD FOREIGN KEY([user_id])
    REFERENCES [dbo].[users] ([id]) ON DELETE SET NULL;
END
GO

-- rejected_persons
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[rejected_persons]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[rejected_persons](
        [id] [int] IDENTITY(1,1) NOT NULL,
        [name] [nvarchar](100) NULL,
        [image_path] [nvarchar](max) NULL,
        [reason] [nvarchar](max) NULL,
        [detected_at] [datetime] NULL,
        [detected_date] [date] NULL,
        [detected_time] [time](7) NULL,
        PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    ALTER TABLE [dbo].[rejected_persons] ADD DEFAULT (getdate()) FOR [detected_at];
    ALTER TABLE [dbo].[rejected_persons] ADD DEFAULT (CONVERT([date],getdate())) FOR [detected_date];
    ALTER TABLE [dbo].[rejected_persons] ADD DEFAULT (CONVERT([time],getdate())) FOR [detected_time];
END
GO

-- videos
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[videos]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[videos](
        [id] [int] IDENTITY(1,1) NOT NULL,
        [file_path] [nvarchar](max) NULL,
        [recorded_at] [datetime] NULL,
        PRIMARY KEY CLUSTERED ([id] ASC)
    );
    
    ALTER TABLE [dbo].[videos] ADD DEFAULT (getdate()) FOR [recorded_at];
END
GO

-- Create SQL login if not exists and add to db_owner
USE [master];
GO

IF NOT EXISTS (SELECT name FROM sys.sql_logins WHERE name = 'smartaccess')
BEGIN
    CREATE LOGIN smartaccess WITH PASSWORD = 'SmartAccess123!';
END
GO

USE [smart_access_system];
GO

IF NOT EXISTS (SELECT name FROM sys.database_principals WHERE name = 'smartaccess')
BEGIN
    CREATE USER smartaccess FOR LOGIN smartaccess;
    ALTER ROLE db_owner ADD MEMBER smartaccess;
END
GO
