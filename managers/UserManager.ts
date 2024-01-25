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
    // public connectedUsers: ConnectedUser[];
    public connectedUsersMap: Map<string, string | null>;
    private users: User[];
    private queue: string[];
    private roomManager: RoomManager;

    constructor() {
        this.users = [];
        this.queue = [];
        this.connectedUsersMap = new Map();
        this.roomManager = new RoomManager();
    }

    async addUser(name: string, gender: string, location: string, socket: Socket) {
        this.users.push({
            name, socket, gender, location
        })
        this.connectedUsersMap.set(socket.id, null);
        this.queue.push(socket.id);
        socket.emit("lobby");
        await this.clearQueue()
        await this.initHandlers(socket);
    }

    async removeUser(socketId: string) {
        this.users = this.users.filter(x => x.socket.id !== socketId);
        this.queue = this.queue.filter(x => x !== socketId);
        let peerId = this.connectedUsersMap.get(socketId);
        if (peerId !== null && peerId !== undefined) {
            this.connectedUsersMap.set(peerId, null);
        }
        this.connectedUsersMap.delete(socketId);
        return peerId;
    }

    async skipUser(socketId: string) {
        let peerId = this.connectedUsersMap.get(socketId);
        if (peerId !== null && peerId !== undefined) {
            this.connectedUsersMap.set(peerId, null);
        }
        this.connectedUsersMap.set(socketId, null);
        await this.addToQueue(socketId);
        return peerId;
    }

    async addToQueue(id: string) {
        this.queue.push(id);
        this.clearQueue();
    }

    async clearQueue() {
        if (this.queue.length < 2) {
            console.log("length is less than 2 return from here");
            return;
        }
        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
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
        this.connectedUsersMap.set(user1.socket.id, user2.socket.id);
        this.connectedUsersMap.set(user2.socket.id, user1.socket.id);
        this.roomManager.createRoom(user1, user2);
        console.log(this.connectedUsersMap)
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