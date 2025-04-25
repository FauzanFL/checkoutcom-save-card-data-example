const path = require('path');
require('dotenv').config({path: path.resolve(__dirname, '../.env')});
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());

app.use(express.json());

const CHECKOUT_SECRET_KEY = process.env.SECRET_KEY;

let custId = 1;
const instruments = []

app.post("/store-instrument", async (req, res) => {
    try {
        const body = req.body;
    
        const data = {
            type: "token",
            token: body.token
        }
    
        const instrumentRes = await axios.post(
            'https://api.sandbox.checkout.com/instruments',
            data,
            {
                headers: {
                    Authorization: `Bearer ${CHECKOUT_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            },
        );
    
        const instrumentId = instrumentRes.data.id;

        instruments.push(
            {
                id: custId,
                instrument_id: instrumentId,
                bin: body.bin,
                exp_month: body.exp_month,
                exp_year: body.exp_year,
                last4: body.last4,
                card_type: body.card_type,
            }
        );

        custId++;
        return res.json({instrument_id: instrumentId});
    } catch (e) {
        console.error(e.response?.data || e.message);
        return res.status(500).send({error: 'Failed to store instrument'})
    }
})

app.get("/customers/:id", async (req, res) => {
    const {id} = req.params;

    const result = instruments.find(i => i.id == id);
    return res.send(result);
})

app.get("/customers", async (req, res) => {
    return res.send(instruments);
})

app.post("/payout", async (req, res) => {
    const {id, amount} = req.body;

    const cust = instruments.find(v => v.id == id);
    const instrumentId = cust.instrument_id;

    try {
        const data = {
            source: {
                type: 'id',
                id: instrumentId,
            },
            amount: amount*1000,
            currency: 'BHD',
            processing_channel_id: process.env.PROCESSING_CHANNEL_ID
        }

        const payment = await axios.post(
            "https://api.sandbox.checkout.com/payments",
            data,
            {
                headers: {
                    Authorization: `Bearer ${CHECKOUT_SECRET_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        )

        return res.send(payment.data)
    } catch (e) {
        console.error(e.response?.data || e.message);
        return res.status(500).send({error: 'Payment failed'})
    }
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});