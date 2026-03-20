# Requirements Compliance – GIFT MART

This document checks whether the website fulfills the stated user stories and acceptance criteria.

---

## 1. User: Search and Filter Products

| Requirement | Status | Notes |
|-------------|--------|--------|
| **Search by keyword** | ✅ Backend / ⚠️ Frontend | Backend `/api/products/search?keyword=...` works. Frontend sends `keyword` and shows API results **only when backend returns products with images**; otherwise it shows all mock products (search/filter not applied to mock). |
| **Filter by category** | ✅ | Backend supports `categories` (list). Frontend has category checkboxes and sends them to API. Same caveat: when API returns empty, mock list is shown without filtering. |
| **Filter by attributes** | ✅ Partial | Customizable-only and max price are supported (backend + ProductFilterPanel). |
| **Accurate and fast results** | ✅ Backend | Search uses regex on name/description/category; filters are applied in one query. |
| **Scenario 1 – Search** | ✅ When API has data | When user enters keyword, matching products are shown if the API returns them with images. |
| **Scenario 2 – Filter** | ✅ When API has data | When user applies category/options, only matching products are shown from API. |
| **Scenario 3 – Search + Filter** | ✅ When API has data | Backend combines keyword + categories + customizable + maxPrice in one request. |

**Gap:** When the backend has no (or no valid) products, the Products page shows **all mock products in random order** and does **not** apply search/filter on the client. So search/filter “work” only when the database has products and they have images.

---

## 2. User: View Products by Category

| Requirement | Status | Notes |
|-------------|--------|--------|
| **Display products by category** | ✅ | Bouquets, Flash Cards, Frames, Gift Boxes pages show only that category (mock or API). |
| **Pagination for category listings** | ❌ | Backend supports pagination (`page`, `size`), but **category pages do not use it**: they request up to 100 items and show all. No “Next/Previous” or page numbers on Frames, Bouquets, Flash Cards, Gift Boxes. |
| **Fast loading and accurate results** | ✅ | Category pages load mock first, then optionally replace with API. |
| **Scenario 1 – Filter by category** | ✅ | Selecting a category (or opening /products/bouquets etc.) shows only that category. |
| **Scenario 2 – Pagination** | ❌ | No pagination UI; no “correct subset” per page on category pages. |
| **Scenario 3 – Consistent layout** | ✅ | ProductGrid is used everywhere; layout is consistent. |

**Gap:** **Pagination is missing** on category pages (and on the main Products page). Backend already returns `totalPages`, `number`, etc., but the frontend does not use them or show pagination controls.

---

## 3. Admin: Create, View, Update, Delete Categories

| Requirement | Status | Notes |
|-------------|--------|--------|
| **Create category (name, description)** | ✅ | Admin “Labels” form: name + description. POST `/api/admin/categories`. |
| **View all categories** | ✅ | GET `/api/admin/categories`; table lists all. |
| **Update category** | ✅ | PUT `/api/admin/categories/{id}`; edit row and save. |
| **Delete category** | ✅ | DELETE with confirmation. |
| **Unique category name** | ✅ Backend | Backend checks `existsByName` on create and update; returns 400 if duplicate. |
| **Required fields validated** | ✅ Backend | Name required (blank check); 400 if missing. |
| **Scenario 1 – Create** | ✅ | Valid details → created and stored. |
| **Scenario 2 – Update** | ✅ | Edit and save → updated. |
| **Scenario 3 – Delete** | ✅ | Delete → removed from list. |
| **Scenario 4 – Validate** | ⚠️ Partial | Backend validates and returns error messages. Frontend only shows a generic `alert('Failed')` and does not display the server’s validation message (e.g. “Category name is required”, “Category already exists”). |

**Gap:** **Frontend validation feedback**: admin does not show the API’s validation errors (required field, duplicate name); improving error handling would fully meet the acceptance criteria.

---

## 4. Admin: Create, Update, View, Delete Products

| Requirement | Status | Notes |
|-------------|--------|--------|
| **Create product (name, description, price, category)** | ✅ | Admin “Inventory” form: name, description, price, category, stock, image. POST `/api/admin/products`. |
| **View product list** | ✅ | GET products; table shows all. |
| **Update product** | ✅ | PUT `/api/admin/products/{id}`; edit and save. |
| **Delete / deactivate** | ✅ Delete | Hard delete via DELETE endpoint. No “deactivate”/soft-delete in scope. |
| **Scenario 1 – Create** | ✅ | Valid product → created and saved. |
| **Scenario 2 – Update** | ✅ | Update details → saved. |
| **Scenario 3 – Delete** | ✅ | Delete → product removed. |

**Note:** Backend has `isActive` on products; admin UI does not expose “deactivate” as an option. Delete is implemented as full removal.

---

## Summary Table

| Area | Fulfilled | Gaps |
|------|-----------|------|
| **Search & filter (user)** | Yes, when backend has data | Search/filter not applied to mock data when API returns empty or no images. |
| **View by category** | Yes | **Pagination missing** on category and main product listing. |
| **Admin categories CRUD** | Yes | Frontend does not show backend validation errors (required, duplicate name). |
| **Admin products CRUD** | Yes | No “deactivate” option (delete only). |

---

## Recommendations

1. **Search/filter with mock data**  
   When the API returns no (or invalid) results, apply search term and filters **client-side** to the mock product list so Scenarios 1–3 work even without backend data.

2. **Pagination**  
   - Use the existing search/category API `page` and `size` (and response `totalPages`/`number`).  
   - Add pagination controls (Prev/Next, page numbers) on:  
     - Main Products page  
     - Category pages (Bouquets, Frames, Flash Cards, Gift Boxes)

3. **Admin category validation UX**  
   - Read the error response body (e.g. `message`) from the API on 400.  
   - Show that message in the UI (e.g. under the form or in a toast) instead of only “Failed”.

4. **Optional: Deactivate product**  
   - If “delete or deactivate” is required, add an “Active” toggle and use backend `isActive` so products can be hidden without being deleted.

---

**Conclusion:** The site **largely** fulfills the requirements. Main gaps: **(1)** search/filter not applied when showing mock data, **(2)** no pagination on product/category listings, and **(3)** admin category validation errors not shown in the UI. Backend support for search, filter, pagination, and category/product CRUD with validation is in place.
