## UI Components Documentation

This documentation describes the user interface components available in the SciCloud project, built with Vue, TypeScript, Tailwind CSS, and ShadCN/UI for Vue.

## Folder Structure

```
components/
├── ui/               # Base UI components (ShadCN)
│   ├── button/       # Buttons
│   ├── form/         # Form components
│   ├── dialog/       # Modals and dialogs
│   ├── calendar/     # Calendar picker components
│   └── ...
├── shared/          # Shared components across pages
├── admin/           # Admin-specific components
├── notifications/   # Notification system components
├── scheduler/       # Calendar and scheduling components
│   ├── SchedulerCalendar.vue
│   ├── SchedulerDayView.vue
│   ├── SchedulerWeekView.vue
│   └── SchedulerEventDialog.vue
├── editor/          # Rich text editor components
│   └── MarkdownEditor.vue
├── notes/           # Notes management components
├── labs/            # Laboratory management components
│   ├── animals/
│   ├── instruments/
│   └── consumables/
└── projects/        # Project management components
```

## Key Component Systems

### Calendar & Scheduling
The scheduler system provides comprehensive calendar functionality:

- **SchedulerCalendar**: Main calendar component with view switching
- **SchedulerDayView**: Single day view with time slots
- **SchedulerWeekView**: Weekly view with drag-and-drop support
- **SchedulerEventDialog**: Event creation and editing modal

Features:
- Multiple view types (day/week)
- Event categorization (maintenance, experiment, training, meeting, custom)
- Drag-and-drop event management
- Time slot clicking for quick event creation
- Internationalization support

### Rich Text Editor
TipTap-based Markdown editor with formatting toolbar:

- **MarkdownEditor**: Full-featured rich text editor
- Supports bold, italic, strikethrough, headings
- Real-time preview and editing
- Integrated with notes system

### Laboratory Management
Specialized components for scientific workflows:

- **Animal management**: Tracking, health records, protocols
- **Instrument management**: Equipment status, maintenance scheduling
- **Consumables**: Inventory tracking and stock management

### Notification System
Real-time notification components:

- Bell icon with unread count
- Toast notifications via Vue Sonner
- Configurable notification preferences

## Theme and Styles

The application theme is configured in `src/style/main.css` with custom CSS variables. The main colors are:

- Primary: `#2563eb` (blue)
- Secondary: `#f1f5f9` (light gray)
- Background: `#f8fafc`
- Text: `#1e293b`

## Best Practices

1. **Reusable Components**: Create reusable components in the appropriate directory.
2. **Typed Props**: Use TypeScript to type your component props.
3. **Utility Classes**: Utilize Tailwind utility classes for styling.
4. **Accessibility**: Ensure components are accessible (ARIA, keyboard navigation, etc.).
5. **Documentation**: Document component props and usage.
