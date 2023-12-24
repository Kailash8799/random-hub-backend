require('dotenv').config()
import express from "express";
import cors from 'cors'
import { Server } from 'socket.io'
import { createServer } from 'http'
import bodyParser from 'body-parser';
import loginModule from './routes/users/login'
import signupModule from './routes/users/singup'
import forgotModule from './routes/users/forgotpassword'
import verifyuserModule from './routes/users/verifyuser'
import welcomeModule from './routes/default/welcome'
import connectDb from "./middleware/_db";

const PORT = process.env.PORT || 5500;
const app = express();
const server = createServer(app);
const io = new Server(server, {});

connectDb();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(bodyParser.json());
app.use("/", welcomeModule)
app.use("/v1/users/signin", loginModule);
app.use("/v1/users/signup", signupModule);
app.use("/v1/users/forgot", forgotModule);
app.use("/v1/users/verifyemail", verifyuserModule);

server.listen(PORT, () => {
    console.log(`Server is ready ${PORT}`);
})
