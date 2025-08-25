# SciCloud - Language Support & Localization Architecture

## Overview

SciCloud implements a comprehensive internationalization (i18n) and localization (l10n) system built on Vue I18n v9 with TypeScript support. The system provides seamless multi-language support with automatic browser detection, persistent user preferences, and locale-aware formatting.

## Architecture Overview

### Core Technologies
- **Vue I18n v9**: Modern Composition API-based internationalization
- **TypeScript**: Type-safe translation keys and compile-time validation
- **Pinia Store**: Reactive locale state management
- **Browser Integration**: Automatic language detection and persistence
- **Native Intl APIs**: Locale-aware date, number, and currency formatting

### Supported Languages
- **English (en)** - Default language and fallback
- **French (fr)** - Secondary language

### File Structure
```
src/i18n/
├── index.ts              # Main i18n configuration and setup
├── types.ts              # TypeScript definitions and interfaces
├── utils.ts              # Formatting utilities and helpers
└── locales/
    ├── en.json          # English translations (master schema)
    └── fr.json          # French translations

src/stores/
└── locale.store.ts       # Pinia store for locale state management

src/composables/
└── useLocale.ts          # Vue composables for i18n functionality

src/components/
└── LanguageSwitcher.vue  # UI component for language selection
```

## Core Components

### 1. I18n Configuration (`src/i18n/index.ts`)

**Purpose**: Central configuration for Vue I18n with locale management

**Key Features**:
- **Locale Detection**: Automatic browser language detection with fallback
- **Persistence**: localStorage integration for user preferences
- **Format Configuration**: Date, time, number, and currency formats per locale
- **Type Safety**: TypeScript integration for translation validation

**Configuration Options**:
```typescript
{
  defaultLocale: 'en',
  fallbackLocale: 'en',
  detectBrowserLanguage: true,
  storage: { key: 'scicloud-locale', storage: 'localStorage' },
  legacy: false // Uses Composition API
}
```

**Locale Configurations**:
- **English**: US date formats, USD currency, 12-hour time
- **French**: European date formats, EUR currency, 24-hour time

---

### 2. Type System (`src/i18n/types.ts`)

**Purpose**: TypeScript definitions for type-safe translations

**Key Types**:
- `AvailableLocales`: Union type of supported locales ('en' | 'fr')
- `MessageSchema`: Derived from English locale for type safety
- `LocaleConfig`: Locale metadata (name, flag, direction)
- `TranslationKey`: Nested key paths for all translations

**Type Safety Features**:
- **Compile-time Validation**: Ensures all translation keys exist
- **Auto-completion**: IDE support for translation keys
- **Schema Validation**: English locale serves as master schema
- **Nested Key Support**: Type-safe access to nested translation objects

---

### 3. Locale Store (`src/stores/locale.store.ts`)

**Purpose**: Reactive state management for locale preferences

**State Management**:
- `currentLocale`: Active locale code
- `isLoading`: Loading state during locale changes
- `lastChanged`: Timestamp of last locale change
- `localeConfig`: Current locale configuration

**Key Actions**:
- `setLocale(locale)`: Change active locale with persistence
- `toggleLocale()`: Cycle through available locales
- `reset()`: Reset to default locale
- `initialize()`: Setup document attributes and i18n integration

**Integration Features**:
- **Vue I18n Sync**: Automatic synchronization with Vue I18n instance
- **Document Attributes**: Updates `lang` and `dir` attributes
- **Persistence**: Automatic localStorage saving
- **Reactive Updates**: Real-time UI updates on locale changes

---

### 4. Composables (`src/composables/useLocale.ts`)

**Purpose**: Vue composables for i18n functionality in components

#### Main Composables:

##### `useLocale()`
Primary composable for locale management:
- **State Access**: Reactive access to current locale and configuration
- **Actions**: Locale switching and management functions
- **Translation**: Enhanced translation function with fallbacks
- **Configuration**: Access to locale metadata (name, flag, direction)

##### `useTranslation()`
Enhanced translation functions:
- **Fallback Handling**: Automatic fallback text for missing translations
- **Development Warnings**: Console warnings for missing keys
- **Plural Support**: Intelligent plural form handling
- **Type Safety**: Type-checked translation keys

##### `useLocaleFormat()`
Locale-aware formatting utilities:
- **Date Formatting**: Short/long date formats with locale awareness
- **Number Formatting**: Locale-specific number separators
- **Currency Formatting**: Automatic currency symbols and formatting
- **File Size Formatting**: Human-readable file sizes
- **Time Ago Formatting**: Relative time descriptions

##### `useLocalePreferences()`
Browser integration and preference detection:
- **Browser Detection**: Automatic language preference detection
- **Best Match Algorithm**: Intelligent locale matching
- **Auto-setup**: Automatic locale configuration on app startup

---

### 5. Formatting Utilities (`src/i18n/utils.ts`)

**Purpose**: Locale-aware formatting functions using native Intl APIs

**Available Formatters**:
- `formatDateLocalized()`: Date formatting with locale-specific patterns
- `formatNumberLocalized()`: Number formatting with locale separators
- `formatCurrencyLocalized()`: Currency formatting with appropriate symbols
- `formatPercentageLocalized()`: Percentage formatting with locale rules
- `formatFileSizeLocalized()`: File size formatting (bytes to human-readable)
- `formatTimeAgoLocalized()`: Relative time formatting ("2 hours ago")

**Features**:
- **Native Intl Integration**: Uses browser's native internationalization APIs
- **Consistent Formatting**: Uniform formatting across the application
- **Error Handling**: Graceful fallbacks for invalid inputs
- **Locale Awareness**: Automatic format adjustment based on current locale

---

### 6. Translation Files (`src/i18n/locales/`)

**Structure**: Hierarchical JSON structure for organized translations

**Organization Pattern**:
```json
{
  "navigation": { "dashboard": "Dashboard", "projects": "Projects" },
  "common": {
    "actions": { "save": "Save", "cancel": "Cancel" },
    "labels": { "name": "Name", "description": "Description" }
  },
  "dashboard": { "title": "Dashboard", "stats": {...} },
  "projects": { "title": "Projects", "create": {...} }
}
```

**Key Principles**:
- **Hierarchical Organization**: Grouped by feature/page for maintainability
- **English as Master**: English locale defines the schema structure
- **Consistent Naming**: Clear, descriptive key names following patterns
- **Complete Coverage**: All UI text externalized to translation files

---

### 7. Language Switcher (`src/components/LanguageSwitcher.vue`)

**Purpose**: UI component for language selection

**Features**:
- **Multiple Variants**: Icon-only, text, or combined display modes
- **Flag Support**: Visual flag indicators for languages
- **Active State**: Visual indication of current locale
- **Loading States**: UI feedback during locale changes
- **Accessibility**: Proper ARIA labels and keyboard navigation

**Usage Variants**:
- `icon`: Icon-only compact switcher
- `default`: Full text with optional flag
- `ghost`: Subtle button styling
- `outline`: Bordered button styling

## Usage Patterns

### 1. Basic Translation in Components

```vue
<script setup>
import { useTranslation } from '@/composables/useLocale'

const { t } = useTranslation()
</script>

<template>
  <h1>{{ t('dashboard.title') }}</h1>
  <button>{{ t('common.actions.save') }}</button>
</template>
```

### 2. Translation with Variables

```vue
<template>
  <p>{{ t('projects.memberCount', { count: projectMembers.length }) }}</p>
</template>
```

Translation file:
```json
{
  "projects": {
    "memberCount": "{count} member | {count} members"
  }
}
```

### 3. Locale-Aware Formatting

```vue
<script setup>
import { useLocaleFormat } from '@/composables/useLocale'

const { formatDate, formatCurrency, formatFileSize } = useLocaleFormat()
</script>

<template>
  <div>
    <p>{{ formatDate(project.createdAt, 'long') }}</p>
    <p>{{ formatCurrency(project.budget) }}</p>
    <p>{{ formatFileSize(document.size) }}</p>
  </div>
</template>
```

### 4. Conditional Translations

```vue
<script setup>
import { useTranslation } from '@/composables/useLocale'

const { t, te } = useTranslation()
</script>

<template>
  <p v-if="te('optional.message')">
    {{ t('optional.message') }}
  </p>
  <p v-else>
    {{ t('common.fallback.message', {}, 'Default message') }}
  </p>
</template>
```

### 5. Locale Management

```vue
<script setup>
import { useLocale } from '@/composables/useLocale'

const {
  currentLocale,
  setLocale,
  availableLocales,
  localeName,
  isLoading
} = useLocale()

const changeLanguage = async (locale) => {
  await setLocale(locale)
}
</script>
```

## Advanced Features

### 1. Type-Safe Translation Keys

The system provides compile-time validation of translation keys:

```typescript
// ✅ Valid - will compile and work
const text = t('common.actions.save')

// ❌ Invalid - will show TypeScript error
const text = t('common.actions.invalid')
```

### 2. Automatic Browser Detection

The system automatically detects and sets the user's preferred language:

```typescript
// Initialization priority:
// 1. Stored user preference (localStorage)
// 2. Browser language preference
// 3. Default fallback (English)
```

### 3. Persistent User Preferences

User language choices are automatically saved and restored:

```typescript
// Automatic persistence on locale change
setLocale('fr') // Automatically saved to localStorage

// Automatic restoration on app reload
// Language preference restored from localStorage
```

### 4. Fallback System

Robust fallback handling for missing translations:

```typescript
// Fallback priority:
// 1. Requested translation key
// 2. Provided fallback text
// 3. Translation key itself (development)
// 4. Fallback locale (English)
```

### 5. Development Features

Enhanced development experience:

- **Missing Translation Warnings**: Console warnings for missing keys
- **Hot Reload Support**: Live updates during development
- **Type Checking**: Compile-time validation of translation usage
- **Auto-completion**: IDE support for translation keys

## Configuration & Setup

### 1. Adding New Languages

To add a new language:

1. **Create Translation File**: Add new locale file (e.g., `es.json`)
2. **Update Types**: Add locale to `AvailableLocales` type
3. **Add Configuration**: Include in `localeConfigs` array
4. **Add Formats**: Configure date/number formats
5. **Test Coverage**: Ensure all translations are complete

### 2. Translation File Management

**Best Practices**:
- Use English as the master schema
- Maintain consistent key structure across locales
- Group related translations hierarchically
- Use descriptive, self-documenting key names
- Validate completeness with TypeScript

### 3. Performance Considerations

**Optimization Features**:
- **Tree Shaking**: Only used translations included in bundle
- **Lazy Loading**: Potential for dynamic locale loading
- **Caching**: Browser caching of translation files
- **Minimal Bundle**: Efficient Vue I18n Composition API usage

## Best Practices

### 1. Translation Key Organization

```json
{
  "featureName": {
    "title": "Feature Title",
    "description": "Feature description",
    "actions": {
      "create": "Create Item",
      "edit": "Edit Item"
    },
    "messages": {
      "success": "Operation successful",
      "error": "Operation failed"
    }
  }
}
```

### 2. Pluralization Handling

```json
{
  "items": {
    "count": "no items | one item | {count} items"
  }
}
```

### 3. Variable Interpolation

```json
{
  "welcome": "Welcome, {userName}!",
  "progress": "Progress: {current} of {total} ({percent}%)"
}
```

### 4. Consistent Naming Conventions

- Use camelCase for key names
- Group by feature/page context
- Use descriptive, self-documenting names
- Maintain consistent structure across locales

## Integration with SciCloud Components

### 1. Form Validation Messages

All form validation messages are externalized and localized:

```vue
<template>
  <FormField
    :error="errors.email"
    :label="t('forms.labels.email')"
    :placeholder="t('forms.placeholders.email')"
  />
</template>
```

### 2. Toast Notifications

Success/error messages are localized:

```typescript
// Using localized notifications
toast.success(t('notifications.project.created'))
toast.error(t('notifications.project.createError'))
```

### 3. Date Display

All dates respect user's locale preferences:

```vue
<template>
  <time :datetime="isoDate">
    {{ formatDate(project.createdAt, 'long') }}
  </time>
</template>
```

### 4. Number and Currency Display

Financial and numerical data formatted per locale:

```vue
<template>
  <span>{{ formatCurrency(project.budget) }}</span>
  <span>{{ formatNumber(measurement.value, { decimals: 2 }) }}</span>
</template>
```

## Future Enhancements

### Planned Features
- **RTL Language Support**: Right-to-left language compatibility
- **Dynamic Locale Loading**: Lazy-loaded translation files
- **Translation Management**: Admin interface for translation updates
- **Plural Rules**: Enhanced pluralization for complex languages
- **Context-Aware Translations**: Gender and context-sensitive translations

### Scalability Considerations
- **Translation API Integration**: External translation service integration
- **Automated Translation**: Machine translation for initial drafts
- **Crowdsourced Translation**: Community translation contributions
- **Translation Validation**: Automated completeness checking
