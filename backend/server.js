const express = require('express');
require('dotenv').config()
const app = express();

const dbConnection = require('./config/db');
dbConnection(); // database connected

const port = process.env.PORT || 5000;
const errorHandler = require('./middlewares/errorHandlers');


app.use(express.json())
app.get('/',(req,res)=>{
    res.json({message:" server started see for api for auth , workspaces , pages ,blocks"})
})
app.use('/api/auth',require('./routers/authRouters'));
app.use('/api/workspaces',require('./routers/workspacesRouters'));
app.use('/api/pages',require('./routers/pagesRouters'));
app.use('/api/blocks',require('./routers/blocksRouters'));



app.use(errorHandler);

app.listen(port,()=>{
    console.log(`SERVER STARTED ON  - http://localhost:${port}`);
})