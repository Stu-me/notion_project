const mongoose = require('mongoose');

const blockSchema = mongoose.Schema({
    type:{ // what type of data in the block 
        type:String,
        required:true,
        enum:['text','heading','todo','image']
    },
    order:{ 
        type:Number,
        required:true
    },
    page:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Page', // page stores the id that is of the page model
        required:true,
    },
    content:{
        type:String,
    }
},
{
    timestamps:true
})
 // every piece of information on the page is block
module.exports = mongoose.model('Block',blockSchema);