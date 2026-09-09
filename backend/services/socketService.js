const {getIO} = require('../config/socket');


const notifyToAll = (event, data) => {
    const io = getIO();
    io.emit(event, data);
};

const notifyRetailer = (event, data) => {
    const io = getIO();

    io.to("retailer").emit(
        event, data
    )
}

const notifyDispatcher = (event, data) => {
    const io = getIO();

    io.to("dispatcher").emit(
        event, data
    )
}

const notifyRider = (event, data) => {
    const io = getIO();

    io.to("rider").emit(
        event, data
    )
}



module.exports = {
    notifyRetailer,
    notifyDispatcher,
    notifyRider,
    
}