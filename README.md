# FindIt

![JavaScript](https://img.shields.io/badge/JavaScript-49.1%25-f7df1e?style=for-the-badge)
![HTML](https://img.shields.io/badge/HTML-28.4%25-e34c26?style=for-the-badge)
![CSS](https://img.shields.io/badge/CSS-22.5%25-563d7c?style=for-the-badge)

FindIt is a front-end prototype for a campus and community lost-and-found platform. The app allows users to report lost or found items, explore listings, search for matches, review item details, and coordinate safe exchanges.

## Live Demo

🚀 **[Try FindIt Live](https://findit-lost-n-found.vercel.app/)**

## Overview

This repository is designed as a static web application UI demo. It focuses on the product experience and client-side interactions rather than a real backend system. It is ideal for showcasing a lost-and-found product flow or prototyping user interactions.

## Important Note

This project is a frontend-only web app. It does not include a real backend, database, authentication system, or API integration. All content is simulated and stored in the browser using `localStorage`.

Because of this, the project should be treated as a UI prototype or concept demo, not a production-ready full-stack application.

---

## Demo Login Credentials

You can test the app using any of these demo accounts:

| Email | Password | Name |
|-------|----------|------|
| john@campus.edu | password | John Doe |
| jane@campus.edu | password | Jane Smith |
| ali@campus.edu | password | Ali Khan |
| sara@campus.edu | password | Sara Lee |
| sarah@campus.edu | password | Sarah Khan |
| olivia@campus.edu | password | Olivia Smith |

All demo accounts use the password: **`password`**

---

## Key Features

- Home page with search, stats, and featured listings
- Explore page for browsing and filtering lost/found items
- Report page for submitting new item reports
- Item details page with match scoring and claim flow
- Dashboard for activity and analytics overview
- Safe exchange page with guidance for secure meetups
- Client-side filtering, searching, and simulated matching logic

---

## Tech Stack

This project uses:

- HTML5
- CSS3
- JavaScript
- Browser local storage (`localStorage`)

Language composition in this repository:

- JavaScript: 49.1%
- HTML: 28.4%
- CSS: 22.5%

No backend stack has been implemented, including:

- Node.js / Express
- Python / Django / Flask
- PHP / Laravel
- MongoDB / MySQL / PostgreSQL
- Firebase / Supabase
- Authentication server
- REST API service

---

## Project Structure

```text
FindIt/
├── css/
│   └── style.css
├── images/
│   └── demo item visuals
├── js/
│   ├── app.js
│   ├── dashboard.js
│   ├── data.js
│   ├── details.js
│   ├── explore.js
│   ├── index.js
│   ├── report.js
│   └── safe-exchange.js
├── dashboard.html
├── details.html
├── explore.html
├── index.html
├── report.html
├── safe-exchange.html
├── README.md
├── .gitignore
└── LICENSE (if present)
```

---

## How It Works

When the app loads in a browser:

1. The HTML pages load the required CSS and JavaScript assets.
2. JavaScript initializes sample item data and UI state.
3. The app reads and writes data in the browser through `localStorage`.
4. Users can browse listings, report items, and explore match scenarios without a server.

---

## How to Run Locally

### Option 1: Open directly in the browser

Open `index.html` in your browser.

### Option 2: Use a local static server

```bash
cd FindIt
python -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

---

## Data Storage Behavior

The app stores demo data in the browser, including:

- Users
- Lost/found item records
- Claims
- Safe exchange activity

This means:

- Data is not shared across devices
- Data is not backed by a real server
- Data may be cleared when browser storage is reset

This is expected behavior for a frontend prototype.

---

## Backend Status

This project does not currently include any backend implementation.

Planned backend features for a production version could include:

- User authentication and authorization
- Server-side database storage
- API endpoints for items, users, and claims
- Real image upload and storage
- Admin moderation tools
- Notification systems
- Geographic validation and location services

---

## Use Cases

This project works well for:

- UI/UX demonstrations
- Front-end portfolio work
- Academic project showcases
- Prototyping a lost-and-found product flow
- Design concept presentations

---

## Future Enhancements

Possible next steps for the project include:

- Building a Node.js/Express backend
- Adding a real database such as MongoDB or PostgreSQL
- Implementing login/signup with JWT or session-based auth
- Creating a REST API for item management
- Supporting actual image uploads
- Adding real-time notifications and moderation tools
- Deploying the app as a full-stack product

---

## Author

- Abid Hasan
- SEU CSE
- [Portfolio](https://abidhasan27.me)

---

## License

This repository does not currently specify a license in the README. If you plan to publish or share it publicly, consider adding an open-source license such as MIT.
