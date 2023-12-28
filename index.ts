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

app.use(cors());
// app.use(cors({ origin: `${process.env.RANDOMHUB}`}));
app.use(bodyParser.json());
app.use("/", welcomeModule)
app.use("/v1/users/signin", loginModule);
app.use("/v1/users/signup", signupModule);
app.use("/v1/users/forgot", forgotModule);
app.use("/v1/users/verifyemail", verifyuserModule);

server.listen(PORT, () => {
    console.log(`Server is ready ${PORT}`);
})

const allsocketuser = new Set();
const allsocketremaininguser = new Set();
const allusermapbysocketid = new Map();
const userconnections = [];

// io.on("connection", (socket) => {
//     allsocketuser.add(socket.id);
//     allsocketremaininguser.add(socket.id);
//     socket.on("userdata", function (data) {
//         allusermapbysocketid.set(socket.id, data);
//         userconnections.push({ connectionId: socket.id, data: data });
//         io.emit("currentonlineuser", allusermapbysocketid.size);
//     });
//     socket.on("removeuser", () => {
//         allusermapbysocketid.delete(socket.id)
//         allsocketremaininguser.delete(socket.id)
//     })
//     socket.on("offerSentToRemote", (data) => {
//         let offerReceiver = userconnections.find((o) => o.data.name === data.remoteuser);
//         console.log(data)
//         if (offerReceiver) {
//             console.log(offerReceiver);
//             socket.to(offerReceiver.connectionId).emit("ReceiveOffer", data);
//         }

//     })
//     socket.on("answerSentToUser1", (data) => {
//         let answerReceiver = userconnections.find((o) => o.data.name === data.receiver);
//         console.log(data)
//         if (answerReceiver) {
//             console.log(answerReceiver);
//             socket.to(answerReceiver.connectionId).emit("ReceiveAnswer", data);
//         }
//     })

//     socket.on("disconnect", () => {
//         allsocketuser.delete(socket.id);
//         allusermapbysocketid.delete(socket.id)
//         allsocketremaininguser.delete(socket.id)
//         io.emit("currentonlineuser", allusermapbysocketid.size);
//     })
// })

const socketToName = new Map();
const nameToSocket = new Map();

io.on("connection", (socket) => {
    console.log(socket.id)
    socket.on("room:join", (data) => {
        socketToName.set(socket.id, data.name)
        nameToSocket.set(data.name, socket.id);
        io.to(data.name).emit("user:joined", { name: data.name, id: socket.id });
        socket.join(data.name);
        io.to(socket.id).emit("room:join", data);
    })
    socket.on("user:call", ({ to, offer }) => {
        console.log("Offer here")
        console.log(offer)
        io.to(to).emit("incoming:call", { from: socket.id, offer })
    })
    socket.on("call:accepted", ({ to, answer }) => {
        console.log("Call accepted")
        console.log(answer)
        io.to(to).emit("call:accepted", { from: socket.id, answer })
    })

    socket.on("peer:nego:needed", ({ to, offer }) => {
        console.log("peer:nego:needed", offer);
        io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
    });

    socket.on("peer:nego:done", ({ to, answer }) => {
        console.log("peer:nego:done", answer);
        io.to(to).emit("peer:nego:final", { from: socket.id, answer });
    });
})