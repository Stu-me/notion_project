const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config()
const app = express();

const dbConnection = require('./config/db');
dbConnection(); // database connected

const port = process.env.PORT || 5000;
const errorHandler = require('./middlewares/errorHandlers');
const requestTiming = require('./middlewares/requestTiming');


// Allows a short audio recording upload while keeping normal JSON requests bounded.
app.use(express.json({ limit: '5mb' }))
app.use(cors())
app.use(requestTiming)
app.get('/',(req,res)=>{
    res.json({message:" server started see for api for auth , workspaces , pages ,blocks"})
})
app.use('/api/auth',require('./routers/authRouters'));
app.use('/api/workspaces',require('./routers/workspacesRouters'));
app.use('/api/pages',require('./routers/pagesRouters'));
app.use('/api/blocks',require('./routers/blocksRouters'));
app.use('/api/payments', require('./routers/paymentRouters'));
app.use('/api/admin', require('./routers/adminRouters'));
app.use('/api/support', require('./routers/supportRouters'));
app.use('/api/uploads', require('./routers/uploadRouters'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use(errorHandler);

app.listen(port,()=>{
    console.log(`SERVER STARTED ON  - http://localhost:${port}`);
})
