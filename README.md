# SketchKart Atelier

Handmade art marketplace. Artists sell sketches, paintings, portraits and custom gifts. Customers browse, add to cart, order, pay (demo mode) and review.

**Stack:** HTML, CSS, JavaScript (frontend in `public/`), Node.js + Express, MongoDB, JWT login.

## Run locally
```bash
npm install
cp .env.example .env     # set MONGO_URI (MongoDB Atlas works) and JWT_SECRET
npm start
```
Open http://localhost:3000. On the first start the app adds a demo artist (demo.artist@sketchkart.test / demo1234) with 4 sample artworks.

## Pages
`index`, `Sketches`, `Paintings`, `Portraits`, `CustomGifts`, `artists`, `login`, `cart`, `orders`, `sell`, `custom`

## Order flow
Ready art: cart → place order → pay → artist delivers → review.
Custom art: request → artist sends price → customer accepts → pays → artist makes it → delivered → review.

## Next steps
Razorpay payments, Cloudinary image storage, remaining footer pages (about, faq, privacy, terms), deploy on Render.
