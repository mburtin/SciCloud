-- Create notifications system tables and configuration
-- Migration: 20250807000000_create_notifications_system.sql

-- Create notification type enum
CREATE TYPE notification_type_enum AS ENUM ('project', 'collaboration', 'system', 'document');

-- Create notification priority enum  
CREATE TYPE notification_priority_enum AS ENUM ('low', 'medium', 'high');

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type notification_type_enum NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN NOT NULL DEFAULT FALSE,
    priority notification_priority_enum NOT NULL DEFAULT 'medium',
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create notification_settings table
CREATE TABLE IF NOT EXISTS notification_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    push_enabled BOOLEAN NOT NULL DEFAULT TRUE, 
    in_app_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    types_config JSONB NOT NULL DEFAULT '{
        "project": {"enabled": true, "email": true, "push": true},
        "collaboration": {"enabled": true, "email": true, "push": true},
        "system": {"enabled": true, "email": false, "push": true},
        "document": {"enabled": true, "email": false, "push": false}
    }',
    quiet_hours_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_user_type ON notifications(user_id, type);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_notifications_updated_at 
    BEFORE UPDATE ON notifications 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_settings_updated_at 
    BEFORE UPDATE ON notification_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notifications table
CREATE POLICY "Users can view their own notifications" 
    ON notifications FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notifications" 
    ON notifications FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
    ON notifications FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
    ON notifications FOR DELETE 
    USING (auth.uid() = user_id);

-- RLS Policies for notification_settings table
CREATE POLICY "Users can view their own notification settings" 
    ON notification_settings FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notification settings" 
    ON notification_settings FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification settings" 
    ON notification_settings FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notification settings" 
    ON notification_settings FOR DELETE 
    USING (auth.uid() = user_id);

-- Enable realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- Create function to auto-create notification settings for new users
CREATE OR REPLACE FUNCTION create_notification_settings_for_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Use dynamic SQL to bypass RLS policies when creating default settings
    EXECUTE format('
        SET LOCAL row_security = off;
        INSERT INTO notification_settings (user_id) 
        VALUES (%L) 
        ON CONFLICT (user_id) DO NOTHING;
    ', NEW.id);
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- If creation fails, log warning but don't block user creation
    RAISE WARNING 'Failed to create notification settings for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-create notification settings when user is created
CREATE TRIGGER create_notification_settings_on_user_creation
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_notification_settings_for_user();

-- Create function to get unread notifications count
CREATE OR REPLACE FUNCTION get_unread_notifications_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER
        FROM notifications
        WHERE user_id = user_uuid AND read = FALSE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON notifications TO authenticated;
GRANT ALL ON notification_settings TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notifications_count(UUID) TO authenticated;