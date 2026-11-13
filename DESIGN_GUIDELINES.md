
# Design Guidelines

## 1. Purpose

This document establishes the visual design system, user experience principles, and frontend implementation standards for GameKanaBa?.

All frontend development must follow these guidelines to ensure a consistent, polished, accessible, and engaging experience.

The goal is to create a modern multiplayer quiz application that feels playful and exciting during gameplay while remaining clean and intuitive for hosts.

---

## 2. Design Direction

### Overall Personality

GameKanaBa? should feel:

- Playful
- Energetic
- Modern
- Friendly
- Competitive
- Approachable
- Polished

The application should balance the excitement of a multiplayer game with the usability of a well-designed web application.

### Visual Inspiration

Use products such as Kahoot! and other interactive quiz platforms as references for interaction patterns and engagement.

Do not directly copy their branding, layouts, illustrations, or visual identity.

Create an original visual identity for GameKanaBa?.

### Design Principles

1. Clarity over decoration.
2. Consistency across all screens.
3. Strong visual hierarchy.
4. Large, readable gameplay elements.
5. Responsive layouts.
6. Meaningful animations and transitions.
7. Accessibility and usability.
8. Avoid unnecessary visual complexity.

Avoid generic AI-generated dashboard aesthetics, excessive gradients, excessive glassmorphism, random decorative elements, and inconsistent component styling.

---

## 3. Design System

Establish reusable design tokens before building multiple screens.

### Colors

Create a consistent color palette with:

- Primary brand color.
- Secondary brand color.
- Accent color.
- Background colors.
- Surface colors.
- Text colors.
- Border colors.
- Success, warning, and error colors.

Gameplay may use more vibrant colors, while host dashboard screens should use a more restrained palette.

Do not introduce arbitrary colors throughout individual components.

Use semantic color tokens instead of hardcoding colors repeatedly.

### Typography

Use a consistent typography system.

Define:

- Display headings.
- Page headings.
- Section headings.
- Body text.
- Labels.
- Captions.
- Gameplay question text.
- Countdown and score typography.

Gameplay questions and answers should prioritize readability, especially on mobile devices and projected displays.

Avoid using too many font families or inconsistent font weights.

### Spacing

Use a consistent spacing scale.

Maintain predictable spacing between:

- Sections.
- Cards.
- Form fields.
- Buttons.
- Navigation elements.
- Gameplay components.

### Borders and Shadows

Use consistent:

- Border radius.
- Border thickness.
- Shadow styles.
- Card treatments.
- Button shapes.

Avoid excessive shadows and unnecessary decorative borders.

---

## 4. Application Layouts

The application has three primary experiences.

### 4.1 Public and Player Experience

Includes:

- Landing page.
- Join game page.
- Guest registration.
- Player lobby.
- Active question screen.
- Answer submission feedback.
- Waiting screen.
- Leaderboard.
- Final results.

Requirements:

- Mobile-first design.
- Large touch-friendly controls.
- Clear instructions.
- Minimal navigation.
- Responsive layouts.
- Obvious feedback for player actions.

Players should be able to participate without creating an account.

### 4.2 Host Experience

Includes:

- Host dashboard.
- Game library.
- Game creation.
- Question editor.
- Game settings.
- Session lobby.
- Live game control.
- Live leaderboard.
- Session results.

Requirements:

- Desktop-friendly dashboard.
- Clear navigation.
- Organized content hierarchy.
- Reusable form components.
- Consistent tables, dialogs, and cards.
- Clear loading, empty, and error states.

The host should be able to manage quizzes and operate live sessions without confusion.

### 4.3 Gameplay and Presentation Experience

Gameplay screens should be treated as a distinct visual experience.

Requirements:

- High visual contrast.
- Large questions and answers.
- Prominent countdown timer.
- Clear answer submission states.
- Immediate visual feedback.
- Readable leaderboard rankings.
- Responsive layouts for different screen sizes.

Consider that a host may display the game on a large screen while players participate using their phones.

---

## 5. Responsive Design

Follow a mobile-first approach for player-facing screens.

Support:

- Mobile phones.
- Tablets.
- Laptops.
- Desktop monitors.
- Large presentation displays.

Do not simply shrink desktop layouts for mobile.

Consider the actual interaction context:

- Players use touchscreens.
- Hosts primarily use desktop controls.
- Presentation screens should be readable from a distance.

Avoid horizontal scrolling unless it is necessary and intentional.

---

## 6. Component Standards

Use reusable components for recurring UI patterns.

Examples:

- Buttons.
- Inputs.
- Selects.
- Dialogs.
- Cards.
- Badges.
- Navigation.
- Loading indicators.
- Empty states.
- Error messages.
- Question cards.
- Answer choices.
- Countdown timers.
- Leaderboard entries.

Use shadcn/ui as the foundation for common interface components.

Customize components to match the GameKanaBa? design system.

Do not create multiple implementations of the same component without a clear reason.

Keep component APIs consistent and reusable.

---

## 7. Interaction and Animation

Animations should improve feedback and make gameplay engaging.

Appropriate examples:

- Button hover and pressed states.
- Question transitions.
- Countdown animations.
- Correct and incorrect answer feedback.
- Leaderboard transitions.
- Score updates.
- Lobby participant arrivals.
- Loading transitions.

Guidelines:

- Keep animations short and purposeful.
- Avoid excessive motion.
- Do not let animations delay important interactions.
- Respect reduced-motion preferences.
- Ensure animations do not interfere with real-time updates.

Gameplay feedback should be immediate and understandable.

---

## 8. Accessibility

Follow practical accessibility standards.

- Maintain sufficient color contrast.
- Use semantic HTML.
- Provide visible keyboard focus.
- Support keyboard navigation.
- Associate form fields with labels.
- Do not rely on color alone to communicate correctness.
- Provide accessible names for icon-only buttons.
- Use appropriate ARIA attributes.
- Respect reduced-motion preferences.
- Ensure readable text sizes.

---

## 9. Frontend Architecture and Styling

- Use Tailwind CSS consistently.
- Use shadcn/ui for reusable interface primitives.
- Use shared design tokens.
- Avoid arbitrary inline styling.
- Avoid duplicated component styles.
- Separate page layouts from reusable components.
- Keep components focused on clear responsibilities.
- Use consistent naming conventions.
- Maintain a clear distinction between host, player, and gameplay components.

Do not introduce additional UI libraries without justification and approval.

---

## 10. Design Quality Requirements

Before considering a screen complete, verify:

- Does it follow the established visual identity?
- Is the visual hierarchy clear?
- Are spacing and typography consistent?
- Are colors being used consistently?
- Is the screen responsive?
- Are interactive states implemented?
- Are loading, empty, and error states handled?
- Is the experience understandable without explanation?
- Does the screen fit its intended user and device?
- Does it feel like part of GameKanaBa? rather than a generic template?

Do not consider a screen complete simply because it renders correctly.

---

## 11. Design Workflow

Before implementing a new major screen or feature:

1. Identify its intended user: host, player, or presentation audience.
2. Identify the primary user action.
3. Define its layout and information hierarchy.
4. Identify reusable components.
5. Check existing design tokens and patterns.
6. Implement the screen.
7. Validate desktop and mobile layouts.
8. Inspect visual consistency with existing screens.
9. Refine spacing, typography, interactions, and accessibility.

When implementing several related screens, establish shared components and patterns first.

---

## 12. Design Approval

For major visual decisions:

- Present design direction before large-scale implementation.
- Explain significant layout or interaction decisions.
- Ask for approval when introducing a new design direction.
- Do not redesign unrelated screens without approval.
- Keep the design system consistent as the application grows.

The guiding principle:

**GameKanaBa? should be easy to use, exciting to play, and visually consistent from the host dashboard to the final leaderboard.**
