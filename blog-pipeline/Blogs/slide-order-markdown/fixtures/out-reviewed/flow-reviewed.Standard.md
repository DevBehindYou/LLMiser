# Flow Reviewed

> **Source:** `flow-reviewed.pptx` (32.2 KB) · **Engine:** MarkItDown

<!-- Slide number: 1 -->
# Fix the Login Error (synthetic sample)
Support team walkthrough

<!-- Slide number: 2 -->

# Diagnosis: steps 1 and 2 find the cause

<!-- Slide number: 3 -->
# Step 1: Symptoms of error 4012
Users see error 4012 after entering a password.
The error appears within two seconds.

<!-- Slide number: 4 -->
# Step 1, continued: Mobile app only
It happens only on the mobile app.
The web sign-in works for the same users.

<!-- Slide number: 5 -->
# Step 2: Cause
The session token expires before the second request.

<!-- Slide number: 6 -->
# Step 3: Fix
Refresh the token before the second request.
Because the token expires early (step 2), refreshing it removes error 4012.
