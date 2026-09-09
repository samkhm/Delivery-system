require('dotenv').config()
const express = require('express')
const http = require("http")
const cors = require('cors')
const connectDB = require("./config/db")

const { initializeSocket } = require("./config/socket")
const authRoutes = require("./routes/authRoutes")
const taskRoutes = require("./routes/tasksRoutes")

const app = express()
connectDB()

app.use(express.json())
app.use(cors(
    {
    origin: process.env.FRONTEND_ORIGIN,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}
))

app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)

const server = http.createServer(app)
initializeSocket(server)

const PORT = process.env.PORT

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
})