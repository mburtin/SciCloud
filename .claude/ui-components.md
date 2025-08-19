## UI Components Documentation

This documentation describes the user interface components available in the SciCloud project, built with Vue, TypeScript, Tailwind CSS, and ShadCN/UI for Vue.

## Folder Structure

```
components/
├── ui/               # Base UI components (ShadCN)
│   ├── button/       # Buttons
│   ├── form/         # Form components
│   ├── dialog/       # Modals and dialogs
│   └── ...
├── shared/          # Shared components across pages
├── admin/           # Admin-specific components
└── notifications/   # Notification system components
```

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
