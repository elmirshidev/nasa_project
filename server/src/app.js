const express = require('express');
const path = require('path');
const app = express();
const morgan = require('morgan');

const api = require('./routes/api')

const cors = require('cors');





app.use(cors({
    origin: 'http://localhost:3000'
}));


app.use(morgan('combined'));

app.use(express.json());

// app.use(express.static(path.join(__dirname , '..' , 'public')));
//
// app.get("*" , (req,res) => {
//     return res.sendFile(path.join(__dirname, '..' , 'public' , 'index.html'))
// })

app.use('/v1' , api)


module.exports = app;

