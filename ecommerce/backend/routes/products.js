const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { requireAdmin } = require('../middleware/auth');

// GET /api/products - list all with filters
router.get('/', async (req, res) => {
  try {
    const { category, search, sort, minPrice, maxPrice, page = 1, limit = 12 } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortOption = sort === 'price_asc' ? { price: 1 }
      : sort === 'price_desc' ? { price: -1 }
      : sort === 'rating' ? { rating: -1 }
      : { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query).sort(sortOption).skip(skip).limit(Number(limit));

    res.json({ success: true, products, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products - admin only
router.post('/', requireAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/products/:id - admin only
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/products/:id - admin only
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/products/seed - seed sample data
router.post('/seed/run', async (req, res) => {
  try {
    await Product.deleteMany({});
    const sampleProducts = [
      {
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and hi-res audio. Perfect for music lovers and remote workers who need deep focus.',
        price: 2999, category: 'Electronics', stock: 50, rating: 4.5, numReviews: 120,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=450&fit=crop&auto=format&q=80'
      },
      {
        name: 'RGB Mechanical Keyboard',
        description: 'Compact TKL mechanical keyboard with Cherry MX blue switches, per-key RGB lighting, and durable aluminium frame. Ideal for gaming and programming.',
        price: 4499, category: 'Electronics', stock: 30, rating: 4.7, numReviews: 85,
        image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&h=450&fit=crop&auto=format&q=80'
      },
      {
        name: 'Pro Running Shoes',
        description: 'Engineered mesh upper with responsive foam midsole for all-day comfort. Breathable, lightweight design ideal for long-distance running and daily training.',
        price: 1899, category: 'Sports', stock: 80, rating: 4.3, numReviews: 200,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=450&fit=crop&auto=format&q=80'
      },
      {
        name: 'Premium Cotton T-Shirt',
        description: '100% organic cotton, pre-shrunk and preshrunk for a lasting fit. Ultra-soft jersey feel with reinforced stitching — available in 10 classic colours.',
        price: 499, category: 'Clothing', stock: 200, rating: 4.1, numReviews: 350,
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=450&fit=crop&auto=format&q=80'
      },
      {
        name: 'JavaScript: The Good Parts',
        description: 'Douglas Crockford guide to writing clean, robust JavaScript. A must-have for every web developer learning the language fundamentals.',
        price: 799, category: 'Books', stock: 45, rating: 4.8, numReviews: 500,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&h=450&fit=crop&auto=format&q=80'
      },
      {
        name: 'Eco-Friendly Yoga Mat',
        description: 'Non-slip natural rubber yoga mat with printed alignment lines, 6mm cushioning for joint support. Includes carry strap. Great for yoga, pilates, and stretching.',
        price: 1299, category: 'Sports', stock: 60, rating: 4.6, numReviews: 175,
        image: 'https://images.unsplash.com/photo-1601925228126-8e8b71e0e9e9?w=600&h=450&fit=crop&auto=format&q=80'
      },
      {
        name: 'LED Architect Desk Lamp',
        description: 'Minimalist LED desk lamp with 5 brightness levels, 3 colour temperatures, 360° adjustable arm, and a built-in USB-A charging port. Energy-efficient & eye-safe.',
        price: 899, category: 'Home', stock: 40, rating: 4.4, numReviews: 90,
        image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=450&fit=crop&auto=format&q=80'
      },
      {
        name: 'SPF 50 Face Moisturizer',
        description: 'Lightweight, non-greasy daily moisturizer with broad-spectrum SPF 50 protection. Dermatologist-tested, suitable for all skin types including sensitive skin.',
        price: 649, category: 'Beauty', stock: 100, rating: 4.2, numReviews: 280,
        image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&h=450&fit=crop&auto=format&q=80'
      },
      {
        name: 'Smart Watch Pro',
        description: 'Feature-packed smartwatch with heart rate monitoring, built-in GPS, SpO2 sensor, sleep tracking, and 7-day battery. Compatible with Android & iOS.',
        price: 8999, category: 'Electronics', stock: 25, rating: 4.6, numReviews: 150,
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=450&fit=crop&auto=format&q=80'
      },
      {
        name: 'Stainless Steel Cookware Set',
        description: '5-piece professional-grade stainless steel cookware set with tempered glass lids. Tri-ply base for even heat distribution, compatible with all stovetops including induction.',
        price: 2499, category: 'Home', stock: 35, rating: 4.3, numReviews: 110,
        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=450&fit=crop&auto=format&q=80'
      },
      {
        name: 'Creative Building Blocks Set',
        description: '520-piece colourful building block set for kids ages 6 and up. Stimulates creativity, spatial thinking, and fine motor skills. Compatible with major brick brands.',
        price: 1599, category: 'Toys', stock: 55, rating: 4.9, numReviews: 420,
        image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&h=450&fit=crop&auto=format&q=80'
      },
      {
        name: 'Portable Bluetooth Speaker',
        description: 'IPX7 waterproof Bluetooth 5.3 speaker with 360° surround sound, deep bass radiator, 12-hour playtime, and built-in mic for hands-free calls. Ideal for outdoors.',
        price: 1999, category: 'Electronics', stock: 45, rating: 4.5, numReviews: 195,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=450&fit=crop&auto=format&q=80'
      }
    ];
    await Product.insertMany(sampleProducts);
    res.json({ success: true, message: `${sampleProducts.length} products seeded successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
