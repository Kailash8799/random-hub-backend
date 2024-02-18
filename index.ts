require('dotenv').config()
import express from "express";
import cors from 'cors'
import { Server, Socket } from 'socket.io'
import { createServer } from 'http'
import bodyParser from 'body-parser';
import loginModule from './src/routes/users/login'
import signupModule from './src/routes/users/singup'
import forgotModule from './src/routes/users/forgotpassword'
import verifyuserModule from './src/routes/users/verifyuser'
import contactuserModule from './src/routes/users/contact'
import editprofileModule from './src/routes/users/editprofile'
import checkoutsessionModule from './src/routes/users/checkoutsession'
import welcomeModule from './src/routes/default/welcome'
import connectDb from "./src/middleware/_db";
import { UserManager } from "./src/managers/UserManager";

const PORT = process.env.PORT || 5500;
const app = express();
const server = createServer(app);
const io = new Server(server, { pingInterval: 60000 });


connectDb();

app.use(cors());
// app.use(cors({ origin: `${process.env.RANDOMHUB}`}));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use("/", welcomeModule)
app.use("/v1/users/signin", loginModule);
app.use("/v1/users/signup", signupModule);
app.use("/v1/users/forgot", forgotModule);
app.use("/v1/users/verifyemail", verifyuserModule);
app.use("/v1/users/contact", contactuserModule);
app.use("/v1/users/editprofile", editprofileModule);
app.use("/v1/users/stripe", checkoutsessionModule);

server.listen(PORT, () => {
    console.log(`Server is ready ${PORT}`);
})

// const allusermapbysocketid = new Map();
// const userconnections = [];

// io.on("connection", (socket) => {
//     allsocketuser.add(socket.id);
//     allsocketremaininguser.add(socket.id);
//     socket.on("userdata", function (data) {
// allusermapbysocketid.set(socket.id, data);
// userconnections.push({ connectionId: socket.id, data: data });
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

// const connectedUsers = [];

const userManager = new UserManager();

// io.on("connection", (socket) => {
//     socket.on("room:join", (data) => {
//         allusermapbysocketid.set(socket.id, data);
//         userconnections.push({ id: socket.id, data: data, remoteId: null });
//         io.to(data.name).emit("user:joined", { name: data.name, id: socket.id });
//         socket.join(data.name);
//         io.to(socket.id).emit("room:join", data);
//     })
//     socket.on("user:call", ({ to, offer }) => {
//         console.log("Offer here")
//         // console.log(offer)
//         io.to(to).emit("incoming:call", { from: socket.id, offer })
//     })
//     socket.on("call:accepted", ({ to, answer }) => {
//         console.log("Call accepted")
//         // console.log(answer)
//         io.to(to).emit("call:accepted", { from: socket.id, answer })
//     })

//     socket.on('ice-candidate', (data) => {
//         io.to(data.id).emit('ice-candidate', data.candidate);
//     });

//     socket.on("peer:nego:needed", ({ to, offer }) => {
//         console.log("peer:nego:needed", offer);
//         io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
//     });

//     socket.on("peer:nego:done", ({ to, answer }) => {
//         console.log("peer:nego:done", answer);
//         io.to(to).emit("peer:nego:final", { from: socket.id, answer });
//     });

//     socket.on("disconnect", () => {
//         const user = allusermapbysocketid.get(socket.id);
//         if (user != undefined) {
//             const remoteId = user.remoteId;
//             if (remoteId != null) {
//                 if (allusermapbysocketid.has(remoteId)) {
//                     allusermapbysocketid[remoteId].remoteId = null;
//                 }
//             }
//             allusermapbysocketid.delete(socket.id)
//         }
//         io.emit("currentonlineuser", allusermapbysocketid.size);
//     })
// })

io.on('connection', (socket: Socket) => {
    console.log('a user connected');
    socket.on("room:join", async (data) => {
        await userManager.addUser(data?.name, data?.gender, data?.location, socket);
    })

    socket.on("skip:user", async () => {
        let id = await userManager.skipUser(socket.id);
        if (id !== undefined && id !== null) {
            io.to(id).emit("user:skiped");
            setTimeout(async () => {
                await userManager.addToQueue(id);
            }, 1000);
        }
    })

    socket.on("sendMessage", ({ roomId, message }: { roomId: string, message: string }) => {
        io.to(roomId).emit("getMessage", { message });
    })

    socket.on("disconnect", async () => {
        console.log("user disconnected");
        let id = await userManager.removeUser(socket.id);
        console.log("Remote : " + id)
        if (id !== undefined && id !== null) {
            io.to(id).emit("remotedisconnect");
            setTimeout(async () => {
                await userManager.addToQueue(id);
            }, 1000);
        }
        // disconnectUser(socket)
    })
});

// function disconnectUser(socket: Socket) {
//     const index = userManager.connectedUsers.findIndex(x => x.id === socket.id);
//     if (index === -1) {
//         console.log(userManager.connectedUsers);
//         return
//     }
//     const peerId = userManager.connectedUsers[index].peerId
//     if (peerId === null) {
//         userManager.connectedUsers.splice(index, 1);
//         console.log("not connected");
//     } else if (userManager.connectedUsers[index]) {
//         io.to(peerId).emit('remotedisconnect');
//         const index2 = userManager.connectedUsers.findIndex(x => x.id === peerId)
//         userManager.connectedUsers[index2].peerId = null
//         userManager.connectedUsers.splice(index, 1);
//         console.log(userManager.connectedUsers);
//     }
// }


// function handleRandomChat(socket) {
//     const availableUsers = connectedUsers.filter(ob => ob.id !== socket.id && ob.peerId === null);
//     if (availableUsers.length > 0) {
//         const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
//         io.to(socket.id).emit('startVideoChat', randomUser.id);
//         io.to(randomUser.id).emit('startVideoChat', socket.id);
//         console.log(socket.id + " connected to " + randomUser.id);
//         const cur = connectedUsers.findIndex(x => x.id === socket.id)
//         const random = connectedUsers.findIndex(x => x.id === randomUser.id)
//         if (connectedUsers[cur]) {
//             connectedUsers[cur].peerId = randomUser.id;
//         }
//         if (connectedUsers[random]) {
//             connectedUsers[random].peerId = socket.id
//         }
//     } else {
//         io.to(socket.id).emit('noAvailableUsers');
//     }
// }

// stripe listen --forward-to=http://localhost:3000/v1/users/stripe/webhook-onetime-payment