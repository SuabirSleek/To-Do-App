# React To-Do App - Design Guidelines

## Design Approach

**Selected System:** Material Design + Productivity App Best Practices (Todoist/Things inspiration)

This task management app prioritizes **clarity, efficiency, and focused interaction**. The design emphasizes clean information hierarchy, generous spacing for touch targets, and subtle visual feedback for task states.

---

## Typography

**Font Family:** Inter or SF Pro Display via Google Fonts
- **Primary Headings:** 24px, semibold (app title, section headers)
- **Task Text:** 16px, regular (default task state)
- **Task Text (Completed):** 16px, regular with strikethrough
- **Input Placeholder:** 15px, light weight
- **Metadata/Counts:** 13px, medium (task counter, timestamps)

---

## Layout System

**Spacing Primitives:** Use Tailwind units of **2, 4, 6, and 8** consistently
- Container padding: `p-6` to `p-8`
- Component spacing: `gap-4` between list items
- Input margins: `mb-6` for separation
- Section spacing: `mt-8` for grouping

**Container Structure:**
- Max-width: `max-w-2xl` centered (`mx-auto`)
- Viewport padding: `px-4` on mobile, `px-6` on desktop
- Vertical spacing: `py-8` on mobile, `py-12` on desktop

---

## Component Library

### Header Section
- App title with icon (checkbox or checkmark symbol from Heroicons)
- Task summary counter ("5 tasks • 2 completed")
- Clean top border or subtle shadow for definition

### Task Input Component
- Full-width text input with generous padding (`px-4 py-3`)
- Rounded corners (`rounded-lg`)
- Placeholder text: "Add a new task..."
- Add button integrated inline (right side) or below input
- Focus state with enhanced border treatment

### Task List Container
- Vertical stack with consistent spacing (`space-y-2`)
- Empty state message when no tasks exist
- Smooth transitions for adding/removing items

### Task Item Component
- Horizontal flex layout with three zones:
  1. **Checkbox** (left): Custom styled checkbox (20px), large touch target (`p-2`)
  2. **Task Content** (center): Task text with flex-grow, proper line-height (1.5)
  3. **Delete Action** (right): Trash icon button from Heroicons, hover state

- Task states:
  - **Active:** Full opacity, clear text
  - **Completed:** Reduced opacity (60%), strikethrough text, checkbox filled
  - **Hover:** Subtle background highlight, delete button becomes visible

- Border treatment: Thin bottom border or individual card with subtle shadow

### Action Buttons
- Primary (Add Task): Full width or auto-width with padding `px-6 py-2.5`
- Delete (Icon only): Square touch target `w-8 h-8`, centered icon
- Rounded corners: `rounded-md` for buttons

---

## Interaction Patterns

**Task Addition:**
- Enter key submits form
- Input clears immediately after adding
- New task appears at top of list with gentle fade-in

**Task Completion:**
- Click anywhere on checkbox to toggle
- Immediate visual feedback (checkbox fill, text strikethrough)
- Completed tasks move to bottom or stay in place based on design choice

**Task Deletion:**
- Single click on delete icon
- Smooth fade-out animation before removal
- No confirmation dialog (quick action)

**Empty States:**
- Centered message: "No tasks yet. Add one to get started!"
- Icon illustration from Heroicons (clipboard or check-circle)

---

## Visual Hierarchy

**Priority Order:**
1. Task input (most prominent, always accessible)
2. Active/incomplete tasks (clear visibility)
3. Completed tasks (reduced visual weight)
4. Metadata and counters (supporting information)

**Spacing Hierarchy:**
- Tight spacing within task items (`gap-3`)
- Medium spacing between tasks (`gap-4`)
- Generous spacing around input (`mb-6 to mb-8`)

---

## Responsive Behavior

**Mobile (< 768px):**
- Single column layout, full-width components
- Larger touch targets (minimum 44px)
- Delete button always visible (no hover state)

**Desktop (≥ 768px):**
- Constrained width for optimal reading
- Delete button appears on hover
- Keyboard shortcuts enabled (Enter to add, Escape to clear)

---

## Icons

**Library:** Heroicons (outline style)
- Checkbox: `check-circle` or custom checkbox
- Delete: `trash`
- Empty state: `clipboard-list`
- Add button: `plus` (if icon button used)

Load via CDN, use 20px size for inline icons, 48px for empty state illustrations.

---

## Accessibility

- All interactive elements keyboard accessible
- Focus indicators on inputs and buttons
- ARIA labels for icon-only buttons ("Delete task", "Mark complete")
- Semantic HTML (form for input, ul/li for task list)
- Sufficient contrast ratios for all text states

---

## Images

**No hero image required** for this utility app. Focus remains on functional interface with clean, uncluttered layout.