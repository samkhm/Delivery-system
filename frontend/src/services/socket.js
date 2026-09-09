import { io } from "socket.io-client";


const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;


let socket = null;


export const startSocket = () => {

    const token = localStorage.getItem("token");


    socket = io(SOCKET_URL, {

        auth: {
            token: token
        }

    });


    return socket;

};


export const stopSocket = () => {

    if (socket) {

        socket.disconnect();

        socket = null;

    }

};


export const getSocket = () => {

    return socket;

};