const mongoose = require('mongoose');

const connectDb = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.CONNECTION_STRING);
        console.log("Database connected",
            conn.connection.host,
            conn.connection.name
        );
        
    } catch (error) {
        console.error('Database  connection Error');
        console.log(error);
        process.exit(1);
    }
}

module.exports = connectDb;