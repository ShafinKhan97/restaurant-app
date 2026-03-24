# Shared Utility Files Documentation

This document explains the purpose, inputs, validation rules, and flow for each of the shared utility files in the `utils/` directory. These files centralize common logic to ensure consistency across controllers and reduce code duplication.

---

## 1. `utils/validators.js`

**Purpose**: Provides standard validation functions for common data types (ObjectIds and names), ensuring uniform data integrity checks before database operations.

### `isValidObjectId(id)`
*   **What it does**: Checks if a given string is a valid MongoDB ObjectId format.
*   **Input**: `id` (String) - e.g., `"65e9b8f..."`
*   **Validation Rules**: Must conform to a 24-character hexadecimal format.
*   **Returns**: `true` if valid, `false` otherwise.
*   **Flow**: Used early in controller functions (e.g., `getRestaurant`, `updateMenuItem`) to prevent throwing internal Mongoose casting errors when an invalid ID is passed in the URL parameters.

### `validateName(value, label)`
*   **What it does**: Validates personal names (like First Name or Last Name) to ensure they are present and contain only letters.
*   **Inputs**:
    *   `value` (String) - The raw input data, e.g., `"John "`.
    *   `label` (String) - The field name for the error message, e.g., `"First name"`.
*   **Validation Rules**:
    1.  Trims whitespace.
    2.  Checks if it's empty -> Returns `"[label] is required"`.
    3.  Checks against Regex `/^[a-zA-Z]+$/` (only alphabetic characters allowed) -> Returns `"[label] can only contain letters"`.
*   **Returns**: A string error message if invalid, or `null` if valid.
*   **Flow**: Used in `authController.js` during signup and profile updates before database insertion.

---

## 2. `utils/errorHandler.js`

**Purpose**: Centralizes the parsing of complex Mongoose error objects into user-friendly JSON responses, maintaining a consistent error shape across the API.

### `handleMongooseError(error, res, entityLabel)`
*   **What it does**: Catches specific database errors (Validation and Duplicate Key) and sends an appropriate HTTP response.
*   **Inputs**:
    *   `error` (Object) - The error object caught in a `catch` block.
    *   `res` (Object) - Express response object.
    *   `entityLabel` (String, optional) - Contextual name for the entity (e.g., `"restaurant"`, `"menu item"`). Defaults to `"record"`.
*   **Validation Rules / Handled Cases**:
    *   **Case 1: `ValidationError` (Name: "ValidationError")**
        *   Occurs when schema constraints (like `required: true` or `enum`) are violated.
        *   Maps all validation error messages into an array.
        *   *Flow*: Sends a `400 Bad Request` with `{ success: false, message: "Validation failed", errors: [...] }`.
    *   **Case 2: `Duplicate Key Error` (Code: 11000)**
        *   Occurs when a unique index constraint (like an email or a slug) is violated.
        *   Extracts the field name that caused the collision.
        *   *Flow*: Sends a `409 Conflict` with `{ success: false, message: "A [entityLabel] with this [field] already exists." }`.
*   **Returns**: The Express response object if an error was handled, or `null` if the error type was unknown (allowing the controller to send a generic 500 server error).

---

## 3. `utils/ownership.js`

**Purpose**: Secures routes by verifying that the requested resource exists and that the currently authenticated user (`req.user`) has permission to access or modify it.

### `verifyRestaurantOwnership(restaurantId, req, res)`
*   **What it does**: Checks if a restaurant exists and belongs to the active admin.
*   **Inputs**: `restaurantId` (String), `req` (Express Request), `res` (Express Response)
*   **Flow / Cases**:
    1.  Validates `restaurantId` using `isValidObjectId`. Sends 400 if invalid.
    2.  Queries DB for `{ _id: restaurantId, is_active: true }`.
    3.  If not found, sends 404.
    4.  Compares `restaurant.admin_id` with `req.user._id`. Sends 403 if they don't match.
    5.  Returns the `restaurant` document if all checks pass, otherwise `null`.

### `findOwnedRestaurant(req, res)`
*   **What it does**: Similar to above, but specifically extracts the ID from `req.params.id`. Used directly inside `restaurantController.js` endpoints.
*   **Flow**: Identical 4-step validation flow as `verifyRestaurantOwnership`.

### `verifyMenuItemOwnership(menuItemId, restaurantId, res)`
*   **What it does**: Checks if a specific menu item belongs to a specific restaurant. (Often chained after verifying the user owns the restaurant).
*   **Inputs**: `menuItemId`, `restaurantId`, `res`
*   **Flow / Cases**:
    1.  Validates `menuItemId` using `isValidObjectId`. Sends 400 if invalid.
    2.  Queries DB for `{ _id: menuItemId, restaurant_id: restaurantId }`.
    3.  If not found, sends 404 `Not found in this restaurant`.
    4.  Returns the `menuItem` document if found, otherwise `null`.

---

## 4. `utils/normalizeFields.js`

**Purpose**: Sanitizes inputs where optional string fields might come from the frontend as empty strings (`""`), converting them to proper `null` values for consistent database storage.

### `normalizeOptionalFields(body, fields)`
*   **What it does**: Iterates over a predefined list of optional fields and normalizes their values.
*   **Inputs**:
    *   `body` (Object) - e.g., `req.body`
    *   `fields` (Array of Strings) - e.g., `["logo_url", "address"]`
*   **Flow**:
    1.  Checks if the field exists in `body` (`!== undefined`).
    2.  If the value is exactly `""`, it maps it to `null`.
    3.  Otherwise, it keeps the original value.
*   **Returns**: A new object containing only the normalized keys present in the input body.

---

## 5. `utils/emailTemplates.js`

**Purpose**: Centralizes HTML formatting for system emails, ensuring brand consistency.

### `pinEmailTemplate(options)`
*   **What it does**: Generates the HTML string for sending PIN codes (verification, password reset).
*   **Inputs**: Options object containing:
    *   `heading`: Main title (`"Verify Your Email"`)
    *   `bodyText`: Instructions text.
    *   `pin`: The actual PIN string.
    *   `footerText` (Optional): Small disclaimer text at the bottom.
*   **Flow**: Interpolates inputs into a responsive, styled inline-CSS HTML layout. Used exclusively by `authController.js` before calling the `sendEmail` service.

---

## 6. `utils/formatResponse.js`

**Purpose**: Ensures that sensitive user data (like passwords or internal database fields) never accidentally leaks to the client by explicitly defining the shape of public API responses.

### `formatAdminResponse(admin)`
*   **What it does**: Strips down a Mongoose `Admin` document into a safe JavaScript object.
*   **Input**: `admin` (Mongoose Document)
*   **Flow**: Extracts only safe fields:
    *   `id`
    *   `first_name`
    *   `last_name`
    *   `email`
    *   `role`
    *   `is_verified`
*   **Returns**: Formatted object. Used in `authController.js` for login, signup, and profile update endpoints prior to sending `res.json()`.
