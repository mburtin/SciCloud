-- Create trigger to update updated_at timestamp
DROP TRIGGER IF EXISTS update_user_calendar_updated_at ON public.user_calendar;
CREATE TRIGGER update_user_calendar_updated_at
  BEFORE UPDATE ON public.user_calendar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS handle_notes_updated_at ON public.notes;
CREATE TRIGGER handle_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.user_notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.user_notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notification_settings_updated_at ON public.user_notification_settings;
CREATE TRIGGER update_notification_settings_updated_at
    BEFORE UPDATE ON public.user_notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to auto-create notification settings when user is created
DROP TRIGGER IF EXISTS create_notification_settings_on_user_creation ON auth.users;
CREATE TRIGGER create_notification_settings_on_user_creation
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_notification_settings_for_user();
