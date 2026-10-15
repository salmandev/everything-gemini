# Browser Testing Recipes

## Recipe 1: Form Fill and Submit Flow
```text
Task: Navigate to http://localhost:3000/contact.
Locate input with id '#name' and type 'Test User'.
Locate input with id '#email' and type 'test@example.com'.
Locate button with text 'Send Message' and click it.
Verify that the success message 'Thank you for contacting us' appears on screen.
Stop condition: Success message is visible or error banner appears.
```

## Recipe 2: Responsive Layout Check
```text
Task: Open http://localhost:3000.
Resize browser window to 375x812 (mobile iPhone viewport).
Verify that the mobile hamburger navigation toggle is visible.
Click the hamburger icon and verify the drawer menu slides in.
Resize back to 1440x900 (desktop viewport) and verify desktop navigation links return.
Stop condition: Both mobile and desktop nav states verified.
```
