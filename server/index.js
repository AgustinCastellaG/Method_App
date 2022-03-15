const express = require("express");
const dotenv = require('dotenv').config()
const cors = require('cors')
const { errorHandler } = require("./middleware/errorMiddleware");
const connectDB = require("./config/db");

connectDB()

const port = process.env.PORT || 8000
const app = express();

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cors())

app.use('/api', require('./routes/routes'))
app.use(errorHandler)


app.listen(port, () => {
  console.log("SERVER RUNNING!");
});