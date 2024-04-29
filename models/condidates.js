const mongoose = require('mongoose');

const condidatesScheme = new mongoose.Schema({
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

const condidates = mongoose.model('condidates',condidatesScheme);
module.exports = condidates