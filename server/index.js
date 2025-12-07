// server/index.js
const express = require('express')
const cors = require('cors')
const path = require('path')

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const artworkRoutes = require('./routes/artworkRoutes')
const accessRequestRoutes = require('./routes/accessRequestRoutes') // Один импорт

const PORT = process.env.PORT || 3000

const server_ex = express()
require('dotenv').config()

// Middleware
server_ex.use(express.json())
server_ex.use(express.urlencoded({ extended: true }))

// Обслуживание статических файлов из папки public и uploads
server_ex.use(express.static(path.join(__dirname, 'public')))
server_ex.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// API маршруты
server_ex.use('/api/auth', authRoutes)
server_ex.use('/api/users', userRoutes)
server_ex.use('/api/artworks', artworkRoutes)
server_ex.use('/api/access', accessRequestRoutes) // Одно подключение

// Fallback для SPA
server_ex.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const start_ex = () => {
    try {
        server_ex.listen(PORT, () => console.log(`Server art gallery running on port ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start_ex()