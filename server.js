require('node:dns').setServers(['8.8.8.8', '1.1.1.1']);
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1e6) + path.extname(file.originalname)),
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => cb(null, /^image\//.test(file.mimetype)),
});

/* ---------- Models ---------- */
const User = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['artist', 'customer'], required: true },
  bio: String,
  city: String,
}, { timestamps: true }));

const Artwork = mongoose.model('Artwork', new mongoose.Schema({
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  category: { type: String, default: 'Sketches' }, // Sketches | Paintings | Portraits | Custom Gifts
  size: String,
  price: { type: Number, required: true, min: 1 },
  image: String,
  sold: { type: Boolean, default: false },
}, { timestamps: true }));

// One model for both order types: "ready" (buy existing art) and "custom" (commission)
const Order = mongoose.model('Order', new mongoose.Schema({
  type: { type: String, enum: ['ready', 'custom'], required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  artwork: { type: mongoose.Schema.Types.ObjectId, ref: 'Artwork' },
  details: String,   // custom: what the customer wants
  size: String,
  refImage: String,
  price: Number,
  deadline: String,
  address: String,
  // requested -> quoted -> awaiting_payment -> paid -> in_progress -> delivered | rejected
  status: { type: String, default: 'awaiting_payment' },
}, { timestamps: true }));

const Review = mongoose.model('Review', new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', unique: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, min: 1, max: 5 },
  comment: String,
}, { timestamps: true }));

/* ---------- Auth helpers ---------- */
const sign = (u) => jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
const safe = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, bio: u.bio, city: u.city });

const auth = (role) => (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    if (role && req.user.role !== role) return res.status(403).json({ error: `Only ${role}s can do this.` });
    next();
  } catch { res.status(401).json({ error: 'Please log in first.' }); }
};
const wrap = (fn) => (req, res) => fn(req, res).catch((e) => res.status(400).json({ error: e.message }));

/* ---------- Auth routes ---------- */
app.post('/api/auth/register', wrap(async (req, res) => {
  const { name, email, password, role, bio, city } = req.body;
  if (!name || !email || !password || password.length < 6) throw new Error('Name, email and a password of 6+ characters are required.');
  if (!['artist', 'customer'].includes(role)) throw new Error('Choose artist or customer.');
  if (await User.findOne({ email })) throw new Error('This email is already registered.');
  const user = await User.create({ name, email, role, bio, city, password: await bcrypt.hash(password, 10) });
  res.json({ token: sign(user), user: safe(user) });
}));

app.post('/api/auth/login', wrap(async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) throw new Error('Wrong email or password.');
  res.json({ token: sign(user), user: safe(user) });
}));

/* ---------- Artists & artworks ---------- */
app.get('/api/artists', wrap(async (req, res) => {
  res.json((await User.find({ role: 'artist' }).select('name bio city')).map((a) => ({ id: a._id, name: a.name, bio: a.bio, city: a.city })));
}));

app.get('/api/artists/:id', wrap(async (req, res) => {
  const artist = await User.findOne({ _id: req.params.id, role: 'artist' }).select('name bio city');
  if (!artist) throw new Error('Artist not found.');
  const artworks = await Artwork.find({ artist: artist._id }).sort('-createdAt');
  const reviews = await Review.find({ artist: artist._id }).populate('customer', 'name').sort('-createdAt');
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;
  res.json({ artist, artworks, reviews, rating: avg });
}));

app.get('/api/artworks', wrap(async (req, res) => {
  const f = { sold: false };
  if (req.query.category) f.category = req.query.category;
  if (req.query.q) f.title = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  res.json(await Artwork.find(f).populate('artist', 'name city').sort('-createdAt').limit(Number(req.query.limit) || 100));
}));

app.post('/api/artworks', auth('artist'), upload.single('image'), wrap(async (req, res) => {
  if (!req.file) throw new Error('Please upload an image.');
  const { title, description, category, size, price } = req.body;
  res.json(await Artwork.create({ title, description, category, size, price, artist: req.user.id, image: '/uploads/' + req.file.filename }));
}));

/* ---------- Orders ---------- */
app.post('/api/orders/buy', auth('customer'), wrap(async (req, res) => {
  const art = await Artwork.findById(req.body.artworkId);
  if (!art || art.sold) throw new Error('This artwork is no longer available.');
  if (!req.body.address) throw new Error('Delivery address is required.');
  res.json(await Order.create({ type: 'ready', customer: req.user.id, artist: art.artist, artwork: art._id, price: art.price, address: req.body.address }));
}));

// Cart checkout: one order per artwork in the cart
app.post('/api/orders/checkout', auth('customer'), wrap(async (req, res) => {
  const { items, address } = req.body;
  if (!address) throw new Error('Delivery address is required.');
  if (!Array.isArray(items) || !items.length) throw new Error('Your cart is empty.');
  const arts = await Artwork.find({ _id: { $in: items }, sold: false });
  if (arts.length !== new Set(items).size) throw new Error('One or more artworks are no longer available. Remove them from the cart.');
  const orders = await Order.insertMany(arts.map((a) => ({ type: 'ready', customer: req.user.id, artist: a.artist, artwork: a._id, price: a.price, address })));
  res.json(orders);
}));

app.post('/api/orders/custom', auth('customer'), upload.single('refImage'), wrap(async (req, res) => {
  const { artistId, details, size, address, deadline } = req.body;
  if (!details || !address) throw new Error('Describe what you want and add a delivery address.');
  res.json(await Order.create({
    type: 'custom', customer: req.user.id, artist: artistId, details, size, address, deadline,
    refImage: req.file ? '/uploads/' + req.file.filename : undefined, status: 'requested',
  }));
}));

app.get('/api/orders/mine', auth(), wrap(async (req, res) => {
  const key = req.user.role === 'artist' ? 'artist' : 'customer';
  const orders = await Order.find({ [key]: req.user.id }).populate('artwork customer artist', 'title image name').sort('-createdAt').lean();
  const reviewed = new Set((await Review.find({ order: { $in: orders.map((o) => o._id) } })).map((r) => String(r.order)));
  res.json(orders.map((o) => ({ ...o, reviewed: reviewed.has(String(o._id)) })));
}));

// Artist: quote a price, reject, start work, mark delivered
app.patch('/api/orders/:id', auth('artist'), wrap(async (req, res) => {
  const o = await Order.findOne({ _id: req.params.id, artist: req.user.id });
  if (!o) throw new Error('Order not found.');
  const { action, price, deadline } = req.body;
  const ok = (...s) => { if (!s.includes(o.status)) throw new Error(`Cannot do this while order is "${o.status}".`); };
  if (action === 'quote') { ok('requested'); if (!(price > 0)) throw new Error('Enter a valid price.'); o.price = price; o.deadline = deadline; o.status = 'quoted'; }
  else if (action === 'reject') { ok('requested'); o.status = 'rejected'; }
  else if (action === 'start') { ok('paid'); o.status = 'in_progress'; }
  else if (action === 'deliver') { ok('paid', 'in_progress'); o.status = 'delivered'; }
  else throw new Error('Unknown action.');
  res.json(await o.save());
}));

// Customer: accept the quote (custom orders) before paying
app.post('/api/orders/:id/accept', auth('customer'), wrap(async (req, res) => {
  const o = await Order.findOne({ _id: req.params.id, customer: req.user.id, status: 'quoted' });
  if (!o) throw new Error('Nothing to accept.');
  o.status = 'awaiting_payment';
  res.json(await o.save());
}));

// DEMO payment. To use real money flow, replace this with Razorpay order + signature verification (see README).
app.post('/api/orders/:id/pay', auth('customer'), wrap(async (req, res) => {
  const o = await Order.findOne({ _id: req.params.id, customer: req.user.id, status: 'awaiting_payment' });
  if (!o) throw new Error('This order cannot be paid right now.');
  o.status = 'paid';
  if (o.type === 'ready') await Artwork.findByIdAndUpdate(o.artwork, { sold: true });
  res.json(await o.save());
}));

app.post('/api/orders/:id/review', auth('customer'), wrap(async (req, res) => {
  const o = await Order.findOne({ _id: req.params.id, customer: req.user.id, status: 'delivered' });
  if (!o) throw new Error('You can review only delivered orders.');
  res.json(await Review.create({ order: o._id, artist: o.artist, customer: req.user.id, rating: req.body.rating, comment: req.body.comment }));
}));

/* ---------- Start ---------- */
async function seedDemo() {
  if (await Artwork.countDocuments()) return;
  const artist = await User.create({ name: 'Demo Artist', email: 'demo.artist@sketchkart.test', role: 'artist', city: 'Patna', bio: 'Demo account with sample artworks.', password: await bcrypt.hash('demo1234', 10) });
  await Artwork.insertMany([
    { title: 'Nature Sketch', category: 'Sketches', price: 1200, image: '/Sketchcard.png' },
    { title: 'Colorful Portrait', category: 'Portraits', price: 1800, image: '/paintingcard.png' },
    { title: 'Abstract Painting', category: 'Paintings', price: 2500, image: '/portraitcard.png' },
    { title: 'Custom Portrait', category: 'Custom Gifts', price: 3000, image: '/giftcard.png' },
  ].map((a) => ({ ...a, artist: artist._id })));
  console.log('Added demo artist and 4 sample artworks');
}

mongoose.connect(process.env.MONGO_URI).then(seedDemo).then(() => {
  app.listen(process.env.PORT || 3000, () => console.log('SketchKart running on http://localhost:' + (process.env.PORT || 3000)));
}).catch((e) => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
