const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { connectDB } = require('../lib/db');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', async (req, res) => {
  try {
    const { clientId, therapistId, amount, description, sessionDate } = req.body;

    if (!clientId || !therapistId || !amount || !description || !sessionDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: description,
            },
            unit_amount: amount * 100,  // Amount must be in cents!
          },
          quantity: 1,
        },
      ],
      success_url: 'https://example.com/success', // <-- Replace with your real frontend
      cancel_url: 'https://example.com/cancel',   // <-- Replace with your real frontend
    });

    // Save the invoice to MongoDB
    const db = await connectDB();
    const invoices = db.collection('invoices');

    const newInvoice = {
      clientId,
      therapistId,
      sessionDate: new Date(sessionDate),
      amount,
      description,
      status: 'pending',
      stripeSessionId: session.id,
      createdAt: new Date()
    };

    await invoices.insertOne(newInvoice);

    res.json({ url: session.url });

  } catch (error) {
    console.error('Stripe error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;