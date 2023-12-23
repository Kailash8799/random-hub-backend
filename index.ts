require('dotenv').config()
import express from "express";
import cors from 'cors'
import { Server } from 'socket.io'
import { createServer } from 'http'
import bodyParser from 'body-parser';
import loginModule from './routes/users/login'
import signupModule from './routes/users/singup'

const PORT = process.env.PORT || 5500;
const app = express();
const server = createServer(app);
const io = new Server(server, {});

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());
app.use("/v1/users/signin", loginModule);
app.use("/v1/users/signup", signupModule);

server.listen(PORT, () => {
    console.log(`Server is ready ${PORT}`);
})
