import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import path from 'path'
import {fileURLToPath} from 'url'
import DB from './db/client.js'
import bodyParser from 'body-parser'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

console.log(__filename, __dirname)

dotenv.config({
    path: './backend/.env'
});

const appHost = process.env.APP_HOST
const appPort = process.env.APP_PORT

console.log(appHost, appPort);
var ROLE = ''
var UserId = -1
const app = express()
app.set('trust proxy', 1)
const db = new DB()

app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
  }))
  
//logging middleware
app.use('*', (req, res, next) => {
    if (req.session.views) {
        req.session.views++
        res.setHeader('Content-Type', 'text/html')
        
    }else {
        req.session.views = 1
    }
    console.log(
        req.method,
        req.baseUrl || req.url,
        new Date().toISOString(),
    )
    next()
})
app.use(bodyParser.urlencoded({
    extended: true
  }))
app.use(bodyParser.json());



app.use("/", express.static(path.resolve(__dirname, '../dist')))
app.use("/tickets", express.static(path.resolve(__dirname, '../dist/')))
// app.use("/auth", express.static(path.resolve(__dirname, '../dist/')))


app.post('/auth', async (req, res) => {
    try {
        const {login, password} = req.body;
        const user = await db.getUser(login, password)
        ROLE = user.role
        UserId = user.iduser
        res.write(JSON.stringify(user))
    } catch (error) {
        console.log('auth failed: ', error)
    }
    console.log(res.statusCode)
    res.end()
})
app.get('/logout', async (req, res) => {
    ROLE = ''
    UserId = -1
    res.end()
})
app.get('/getTickets', async (req, res) => {
    console.log(ROLE)
    if (ROLE != 'cashier' && ROLE != 'admin' && ROLE != 'administrator') {
        res.statusCode = 401
        res.end()
    }
    try {
        const tickets = await db.getTickets()
        res.write(JSON.stringify(tickets))
        res.end()
    } catch (error) {
        console.log('could not get tickets: ', error)
        res.end()
    }
})
app.post('/sellTicket', async (req, res) => {
    console.log(ROLE)
    if (ROLE != 'cashier' && ROLE != 'admin') {
        res.statusCode = 401
        res.end()
    }
    try {
        let {id, passenger} = req.body;
        const date = new Date()
        const cashierId = UserId
        await db.sellTicket({id: id, name: passenger, date: date, cashierID: cashierId})
        res.end()
    } catch (error) {
        console.log('could not sell ticket: ', error)
        res.statusCode = 500
        res.end()
    }
})
const server = app.listen(Number(appPort), appHost, async () => {
    try {
        await db.connect()
    } catch(error) {
        console.log('Server app shut down')
        process.exit(100)
    }
    console.log(`app started at host: http://${appHost}:${appPort}`)
})

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server')
    server.close(async () => {
        await db.disconnect()
        console.log('HTTP server closed')
    })
})