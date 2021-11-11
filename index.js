const express = require('express');
const app = express();
const cors = require('cors');
const admin = require("firebase-admin");
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mangomarketecom.gzttn.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// firebase-adminsdk.json

const serviceAccount = require('./firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


async function run() {
    try {
      await client.connect();
      console.log('Database connected successfully');
      const database = client.db('car_hunter');
      const commonCollection = database.collection('common');
      const usersCollection = database.collection('users');
      const servicesCollection = database.collection('services');
      const ordersCollection = database.collection('orders');
      const headerCollection = database.collection('header');
      const footerCollection = database.collection('footer');
      



      // Get Api

      app.get("/services", async (req, res) => {
        const cursor = servicesCollection.find({});
        const services = await cursor.toArray();
        res.json(services);
      });

      app.get("/common", async (req, res) => {
        const cursor = commonCollection.find({});
        const common = await cursor.toArray();
        res.json(common);
      });

      app.get('/orders', async (req, res) => {
        const cursor = ordersCollection.find({});
        const order = await cursor.toArray();
        console.log(order);
        res.json(order);
      });


      app.post("/services", async (req, res) => {
        const newService = req.body;
        const cursor = servicesCollection.insertOne(newService);
        res.json(cursor);
      });

      app.post('/orders', async (req, res) => {
        const orders = req.body;
        const cursor = ordersCollection.insertOne(orders)
        console.log(orders);
        res.json(cursor);
      });

      app.get("/orders/:email", async (req, res) => {
        const cursor = ordersCollection.find({ email: req.params.email });
        const order = await cursor.toArray();
        res.json(order);
      });

    
     
      

      app.get('/users/:email', async (req, res) => {
        const email = req.params.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let isAdmin = false;
        if (user?.role === 'admin') {
            isAdmin = true;
        }
        res.json({ admin: isAdmin });
    })


      app.post ('/users', async(req, res) => {
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        console.log(result);
        res.json(result)
      })

   

    app.put('/users/admin', async (req, res) =>{
      const user = req.body;
      const filter = {email: user.email}
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    })

    app.delete("/deleteOrder/:id", async(req, res) => {
      console.log(req.params.id);
      const result = await ordersCollection.deleteOne({_id:ObjectId(req.params.id)})
      console.log(result);
      res.send(result);

    }

    )

    } finally {
     
    //   await client.close();
    }
  }
  run().catch(console.dir);

app.get('/', (req,res) => {
    res.send('From Doctors portal')
})

app.listen(port, () => {
    console.log(`Lisitening at port: ${port}`);
})