const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

//midleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ec0jk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('skin_care');
        const productsCollection = database.collection('products');
        const usersCollection = database.collection('users');
        const reviewCollection = database.collection('review');
        const ordersCollection = database.collection('orders');

        //Post Products
        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await productsCollection.insertOne(product);
            res.json(result);
        });
        //GET Products
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            res.json(products)
        });
        //single product
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.json(product);
        });

        //delete product from products collection
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        });

        //post user
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });
        //Post Review
        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            res.json(result);
        });
        //GET Review
        app.get('/reviews', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.json(reviews)
        });

        //post order
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        });
        //get order
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        });

        //get user by email with admin role
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'Admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });

        //user role update
        app.put('/users/:email', async (req, res) => {
            const email = req.body.email;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    role: 'Admin'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result)
        });

        //delete order from orders collection
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });

        //Update order status 
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const updatedOrder = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: updatedOrder.status,

                }
            };
            const result = await ordersCollection.updateOne(filter, updateDoc);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

//get
app.get('/', (req, res) => {
    res.send('Skin care server running.');
});

//listen
app.listen(port, () => {
    console.log('Server is running at port ', port);
})

















// app.put('/users/admin', async (req, res) => {
//     const user = req.body;
//     const requester = req.decodedEmail;
//     console.log(requester)
//     if (requester) {
//         const requesterAccount = await usersCollection.findOne({ email: requester });
//         if (requesterAccount.role === 'admin') {
//             const filter = { email: user.email };
//             const updateDoc = { $set: { role: 'admin' } };
//             const result = await usersCollection.updateOne(filter, updateDoc);
//             res.json(result);
//         }
//     }


// })