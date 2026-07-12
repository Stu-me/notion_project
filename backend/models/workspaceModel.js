const mongoose = require('mongoose')

const workSpaceSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User', // _id  here which will act as common connector 
        required:true
    },
    pages:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Page'
    }]
},{
    timestamps:true
});

module.exports = mongoose.model('Workspace',workSpaceSchema)