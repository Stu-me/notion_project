const mongoose = require('mongoose');

const connectDb = async ()=>{
    try {
        // Reuses a small pool of database connections instead of opening a connection per request.
        const conn = await mongoose.connect(process.env.CONNECTION_STRING, {
            maxPoolSize: 10,
            minPoolSize: 2,
            serverSelectionTimeoutMS: 5000,
        });
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
