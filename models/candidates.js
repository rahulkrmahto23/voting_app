const mongoose = require('mongoose');

const candidatesScheme = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:true
    },
   party:{
    type:String,
    required:true
   },
   votes:[
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            default:'User',
            required:true
        },
        voteAt:{
            type:Date,
            default:Date.now()
        }
    }
   ],
   voteCount:{
    type:Number,
    default:0
   }
})

const candidates = mongoose.model('candidates',candidatesScheme);
module.exports = candidates