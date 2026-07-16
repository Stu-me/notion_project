const mongoose = require('mongoose');

const pageSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    workspace:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Workspace',
        required:true
    },
    blocks:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Block',
        // not required cause new page will have zero blocks
    }],
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    }
},{
    timestamps:true
})

// Supports page listing and free-tier page counting for a workspace.
pageSchema.index({ createdBy: 1, workspace: 1 });

module.exports = mongoose.model('Page',pageSchema);
