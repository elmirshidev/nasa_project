const app = require('./app')
const http = require('http');
const mongoose = require('mongoose')
// const { loadPlanetsData } = require('./models/planets.model');

require('dotenv').config();

const {loadLaunchesData} = require('./models/launches.model')

const PORT = process.env.PORT || 8000;

const MONGO_URL = process.env.MONGO_URL

const server = http.createServer(app);


mongoose.connection.once('open' , () => {
    console.log('MongoDb connection is ready!')
})

mongoose.connection.on('error' , (err) => {
    console.error(err);
})

async function startServer(){
    await mongoose.connect(MONGO_URL)
    await loadLaunchesData()
    server.listen(PORT, () => {
        console.log('listening in backend');
    })
}



startServer();


