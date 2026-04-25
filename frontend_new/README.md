# frontend_new

Simple standalone frontend for testing the backend APIs in this repository.

## Pages

- `http://localhost:4173/` -> main page, loads products from `GET /product`
- `http://localhost:4173/login.html` -> login/register page
- `http://localhost:4173/cart.html` -> cart page

## Run

1. Start the backend first.
2. In this folder, run `npm start`.
3. Open `http://localhost:4173`.

The default API base is `http://localhost:3000`.
If your backend runs on a different port, change it from the input in the header and click `Save API Base`.

Important: use `localhost`, not `127.0.0.1`, for guest-cart testing. The guest cart depends on cookies, and keeping both frontend and backend on `localhost` avoids local cookie issues.

## Backend routes used

- `GET /product`
- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/logout`
- `GET /cart`
- `POST /cart/add`
- `DELETE /cart/item/:item_id`
