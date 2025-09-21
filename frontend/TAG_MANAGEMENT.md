# Tag Management System

This document describes the tag management functionality implemented in the frontend using custom Vue components.

## Features

### 1. Tag Display
- Tags are displayed below each car image
- Tags appear as styled badges with a clean, modern look
- Tags are shown in both the admin panel and search results

### 2. Tag Management (Admin Panel)
- **Add Tags**: Users can add new tags using the integrated Tags Input component
- **Remove Tags**: Users can remove tags by clicking the × button on each tag
- **Real-time Updates**: Tag changes are immediately reflected in the UI
- **API Integration**: All tag operations are synchronized with the backend
- **Validation**: Built-in tag validation with custom rules

### 3. Tag Display (Search Results)
- Tags are displayed in search results for better context
- Tags appear in the image modal when viewing full-size images
- Read-only display (no editing capabilities from search page)

## Components

### TagsInput.vue (UI Component)
- Modern, custom tags input component
- Supports adding/removing tags with keyboard shortcuts
- Built-in validation and duplicate prevention
- Configurable max tags, case sensitivity, and trim options
- Accessible with proper focus management

### TagManager.vue
- Full-featured tag management component using TagsInput
- Used in the admin panel
- Supports adding and removing tags with API integration
- Includes loading states and error handling
- Real-time synchronization with backend

### TagDisplay.vue
- Simple read-only tag display component
- Used in search results and modals
- Shows tags as styled badges
- Displays "No tags" when no tags are present

## Usage

### In Admin Panel
```vue
<TagManager
  :image-id="image.id"
  :initial-tags="image.tags || []"
  @tags-updated="(updatedTags) => updateImageTags(image.id, updatedTags)"
/>
```

### In Search Results
```vue
<TagDisplay :tags="result.tags || []" />
```

### Direct TagsInput Usage
```vue
<TagsInput
  v-model="tags"
  placeholder="Add tags..."
  :validate-tag="validateTag"
  :max-tags="10"
  @tag:add="handleTagAdd"
  @tag:remove="handleTagRemove"
/>
```

## User Interactions

### Adding Tags
1. Type a tag name in the input field
2. Press Enter or blur the input field
3. Tag is immediately added and synced with the backend
4. Built-in validation prevents invalid tags

### Removing Tags
1. Click the × button on any tag
2. Tag is immediately removed and synced with the backend
3. Visual feedback with hover effects

### Keyboard Shortcuts
- **Enter**: Add the current tag
- **Backspace**: Remove the last tag (when input is empty)
- **Escape**: Clear the input field

## API Integration

The tag management system integrates with the following backend endpoints:

- `POST /api/images/:id/tags` - Add a new tag
- `DELETE /api/images/:id/tags/:tag` - Remove a specific tag
- `PUT /api/images/:id/tags` - Update all tags for an image

## Error Handling

- Network errors are displayed to the user
- Duplicate tags are prevented
- Empty tags are filtered out
- Loading states provide user feedback

## Styling

- Tags use the existing Badge component for consistency
- Hover effects indicate interactive elements
- Color coding: secondary badges for display, red hover for removal
- Responsive design works on all screen sizes
