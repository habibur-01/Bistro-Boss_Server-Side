const express = require('express')
require('dotenv').config()
const app = express()
const cors = require('cors')
const port = process.env.PORT || 3000

// middleware
app.use(cors({
    origin: [
        'http://localhost:5173'
    ],
    credentials: true
}));
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASS}@cluster0.cbqlcas.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();


        const menuCollection = client.db("Bistro_Boss").collection('menu')
        const reviewCollection = client.db("Bistro_Boss").collection('reviews')
        const userCollection = client.db("Bistro_Boss").collection('user')
        const cartCollection = client.db("Bistro_Boss").collection('cartItem')



        // post user data
        app.post("/users", async (req, res) => {
            const user = req.body
            const result = await userCollection.insertOne(user)
            res.send(result)
        })
        // get user data
        app.get("/users", async (req, res) => {
            const result = await userCollection.find().toArray()
            res.send(result)
        })
        // delete user
        app.delete("/users/:id", async (req, res) => {
            const id = req.params.id
            const query = {_id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query)
            res.send(result)
        })
        // update user data(make admin)
        app.patch("/users/admin/:id", async(req, res)=>{
            const id = req.params.id
            const query = {_id: new ObjectId(id)}
            const updateDoc={
                $set:{
                   role: 'admin'
                }
            }
            const result = await userCollection.updateOne(query, updateDoc)
            res.send(result)
        })
        // get menu data
        app.get("/menu", async (req, res) => {
            const result = await menuCollection.find().toArray()
            res.send(result)
        })

        // get reviews data
        app.get("/reviews", async (req, res) => {
            const result = await reviewCollection.find().toArray()
            res.send(result)
        })

        app.post("/carts", async (req, res) => {
            const cartItem = req.body
            const result = await cartCollection.insertOne(cartItem)
            res.send(result)
        })
        app.get("/carts", async (req, res) => {
            let query = {}
            const email = req.query.email
            if (req.query?.email) {
                query = { email: email }
            }

            const result = await cartCollection.find(query).toArray()
            res.send(result)
        })

        app.delete("/carts/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: new ObjectId(id) }
            const result = await cartCollection.deleteOne(query)
            res.send(result)
        })


        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Bistro-Boss')
})
app.listen(port, () => {
    console.log(`Bistro boss is running on port ${port}`)
})