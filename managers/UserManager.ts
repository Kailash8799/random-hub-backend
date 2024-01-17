import { Socket } from "socket.io";
import { RoomManager } from "./RoomManager";

export interface User {
    socket: Socket;
    name: string;
    gender: string;
    location: string;
}

export interface ConnectedUser {
    id: string,
    peerId: string | null
}

export class UserManager {
    public connectedUsers: ConnectedUser[];
    private users: User[];
    private queue: string[];
    private roomManager: RoomManager;

    constructor() {
        this.users = [];
        this.queue = [];
        this.connectedUsers = [];
        this.roomManager = new RoomManager();
    }

    async addUser(name: string, gender: string, location: string, socket: Socket) {
        this.users.push({
            name, socket, gender, location
        })
        this.queue.push(socket.id);
        socket.emit("lobby");
        await this.clearQueue()
        await this.initHandlers(socket);
    }

    async removeUser(socketId: string) {
        this.users = this.users.filter(x => x.socket.id !== socketId);
        const index = this.connectedUsers.findIndex(x => x.id === socketId);
        let us: { id: string, peerId: string } = this.connectedUsers.filter(x => x.id === socketId)[0];
        let peerId = us?.peerId;
        if (peerId !== null && peerId !== undefined) {
            const index2 = this.connectedUsers.findIndex(x => x.id === peerId)
            if (index2 !== -1) {
                this.connectedUsers[index2].peerId = null
            }
        }
        this.connectedUsers.splice(index, 1);
        this.queue = this.queue.filter(x => x !== socketId);
        return peerId;
    }

    async addToQueue(id: string) {
        this.queue.push(id);
        console.log("Add in addToQueue :: :: " + id)
        this.clearQueue();
    }   

    async clearQueue() {
        console.log("inside clear queues")
        console.log(this.queue);
        if (this.queue.length < 2) {
            console.log("length is less than 2 return from here");
            return;
        }
        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
        console.log("id is " + id1 + " " + id2);
        const user1 = this.users.find(x => x.socket.id === id1);
        const user2 = this.users.find(x => x.socket.id === id2);

        if (!user1 && user2) {
            this.queue.push(user2.socket.id);
            this.clearQueue();
            return;
        }
        if (user1 && !user2) {
            this.queue.push(user1.socket.id);
            this.clearQueue();
            return;
        }
        if (!user1 && !user2) {
            this.clearQueue();
            return;
        }
        console.log("creating roonm");
        const index = this.connectedUsers.findIndex(x => x.id === user1.socket.id);
        const index2 = this.connectedUsers.findIndex(x => x.id === user2.socket.id);
        console.log(this.connectedUsers)
        this.connectedUsers[index].peerId = user2.socket.id;
        this.connectedUsers[index2].peerId = user1.socket.id;
        this.roomManager.createRoom(user1, user2);
        this.clearQueue();
    }

    async initHandlers(socket: Socket) {
        socket.on("offer", ({ sdp, roomId }: { sdp: string, roomId: string }) => {
            this.roomManager.onOffer(roomId, sdp, socket.id);
        })

        socket.on("answer", ({ sdp, roomId }: { sdp: string, roomId: string }) => {
            this.roomManager.onAnswer(roomId, sdp, socket.id);
        })

        socket.on("add-ice-candidate", ({ candidate, roomId, type }) => {
            this.roomManager.onIceCandidates(roomId, socket.id, candidate, type);
        })
    }

}