const express = require('express');
const cors = require('cors');
require('dotenv').config()
const app = express();

const dbConnection = require('./config/db');
dbConnection(); // database connected

const port = process.env.PORT || 5000;
const errorHandler = require('./middlewares/errorHandlers');
const requestTiming = require('./middlewares/requestTiming');


app.use(express.json())
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



app.use(errorHandler);

app.listen(port,()=>{
    console.log(`SERVER STARTED ON  - http://localhost:${port}`);
})
