const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken')
require('dotenv').config() ;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { object } = require('webidl-conversions');
const app = express();
const port = process.env.PORT || 5000 ;



//middlewear
app.use(cors());
app.use(express.json());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ttkt4y5.mongodb.net/?retryWrites=true&w=majority`;

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
    //await client.connect();

   // database collections

   const foodItemCollections = client.db('restaurantDB').collection('foodItemCollections')

   const allFoodCollections = client.db('restaurantDB').collection('allFoodItems')
   const purchaseCollections = client.db('restaurantDB').collection('foodPurchase')

   const addAItemCollections = client.db('restaurantDB').collection('addAItem')

    // auth relared API:
    app.post('/jwt', async(req,res) =>{
      const user = req.body ;
      console.log(user) ;
      const token = jwt.sign(user, 'secret', {expiresIn:'1h'})
      res.send(token)
    })

   //top food sections 
   app.get('/foodItems', async(req,res) =>{
    const cursor = foodItemCollections.find();
    const result = await cursor.toArray();
    res.send(result);
   })

   // all food pages
   app.get('/allFoodItems', async(req,res) =>{
    const page = parseInt(req.query.page)
    const size = parseInt(req.query.size)
    console.log('pagination',size, page)
    const result = await allFoodCollections.find() 
    .skip(page*size)
    .limit(size)
    .toArray();
    res.send(result);
   })
   // single food data
   app.get('/allFoodItems/:id', async (req,res) =>{
    const id = req.params.id ;
    const query = { _id: new ObjectId(id)};
    const result = await allFoodCollections.findOne(query) ;
    res.send(result)
   })

   // purchases food post here
   app.post('/foodPurchase', async (req,res) =>{
     const purchaseItem = req.body ;
     const result = await  purchaseCollections.insertOne(purchaseItem)
     res.send(result) ;

   })

   // purchase get method:
   app.get('/foodPurchase', async(req,res) =>{
    const cursor = purchaseCollections.find();
    const result = await cursor.toArray();
    res.send(result);
   })

   // delete from my cart:
   app.delete('/foodPurchase/:id', async (req,res) =>{
    const id = req.params.id ;
    const query = {_id : new ObjectId(id)}
    const result = await purchaseCollections.deleteOne(query);
    res.send(result);
  })

    //add a item get method
    app.get('/addFoodItem', async(req,res) =>{
      const cursor = addAItemCollections.find();
      const result = await cursor.toArray();
      res.send(result);
     })
   // add a item
   app.post('/addFoodItem', async (req,res) =>{
    const addItem = req.body ;
    const result = await addAItemCollections.insertOne(addItem)
    res.send(result) ;
   })
   // update:
   app.put('/addFoodItem/:id', async(req,res) =>{
    
    const id = req.params.id ;
    const filter = {_id: new ObjectId(id)}
    const options = {upsert:true}
    const updatedItem = req.body ;
    const item = {
      $set :{
        foodName :updatedItem.foodName,
        price : updatedItem.price,
        category: updatedItem.category,
        email:updatedItem.email,
        origin:updatedItem.origin,
        photo:updatedItem.photo

      }
    }
  
    const result = await addAItemCollections.updateOne(filter,item,options) 
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



app.get('/', async (req,res) =>{
    res.send('server is running succesfully')
})

app.listen(port, () =>{
    console.log(`server is running on port ${port}`)
})