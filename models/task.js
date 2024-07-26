const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    points:{type: Number,required:true},
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    postedBy: { type: String, required: true },
    reservedBy: { type: String, default: null } 
});

module.exports = mongoose.model('Task', taskSchema);
