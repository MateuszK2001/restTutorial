import { Server } from 'http';
import { Server as SocketServer } from 'socket.io';
import sio from 'socket.io';

let io:SocketServer;


export const init = (httpServer:Server)=>{
    io = sio(httpServer);
    return io;
}
export const getIO = ()=>{
    if(!io){
        throw new Error("Socket.io not initialized");
    }
    return io;
}