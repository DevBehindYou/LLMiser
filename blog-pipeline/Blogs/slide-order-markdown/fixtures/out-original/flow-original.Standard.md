# Flow Original

> **Source:** `flow-original.pptx` (32.5 KB) · **Engine:** MarkItDown

<!-- Slide number: 1 -->
# Fix the Login Error (synthetic sample)
Support team walkthrough

<!-- Slide number: 2 -->

# Diagnosis

<!-- Slide number: 3 -->
Step 1 of 3
# Symptoms
Users see error 4012 after entering a password.
The error appears within two seconds.

<!-- Slide number: 4 -->
# Symptoms
It happens only on the mobile app.
The web sign-in works for the same users.

<!-- Slide number: 5 -->
Step 2 of 3
# Cause
The session token expires before the second request.

<!-- Slide number: 6 -->
Step 3 of 3
Fix
Refresh the token before the second request.
As the previous slide shows, timing is the cause.
