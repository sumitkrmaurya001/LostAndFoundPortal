# Lost & Found Portal — Lost & Found Portal

A redesigned Lost & Found Portal using HTML/CSS/JavaScript, Node.js/Express, MongoDB and bcrypt.

## Main improvements
- Modern responsive UI inspired by the supplied Lost & Found templates.
- Search by item, category and location.
- Lost / Found filters and category filters.
- Report statistics and community feature cards.
- Image preview before uploading.
- Account-based report ownership.
- Secure server-side owner check for **edit and delete**.
- Signed login session token so changing localStorage cannot change ownership.
- Report status: Active / Resolved.
- Detailed report page.

## Run

1. Start MongoDB locally.
2. Open a terminal in `backend`.
3. Run:
   ```
   npm install
   npm start
   ```
4. Open the project folder with VS Code.
5. Use Live Server on `index.html`.
6. Register a new account and login.

Backend: `http://localhost:5000`

MongoDB database: `lostandfound`

## Important ownership fix
Each new report stores the authenticated user's `ownerId`.
The PUT and DELETE routes query by both item id and owner id. Therefore, even if a user manually changes the item id in the URL, the server returns 403 and does not modify another user's report.

Existing reports created by the old version may not have an `ownerId`. They are intentionally treated as legacy/read-only records because the old system did not record ownership.
