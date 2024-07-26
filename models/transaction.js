const mongoose = require('mongoose');
const TransactionSchema = new mongoose.Schema({
    from: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    to: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    points: { 
        type: Number, 
        required: true 
    },
    task: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Task' 
    },
    date: { 
        type: Date, 
        default: Date.now 
    }
});
module.exports = mongoose.model('Transaction', TransactionSchema);