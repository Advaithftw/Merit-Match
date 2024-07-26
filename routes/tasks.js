const express = require('express');
const passport = require('passport');
const Task = require('../models/task');
const User = require('../models/user');
const Transaction = require('../models/transaction');

const router = express.Router();


const authenticate = passport.authenticate('jwt', { session: false });


router.post('/tasks', authenticate, async (req, res) => {
    try {
        const { title, description, points, status = 'pending' } = req.body;

        
        const postedBy = req.user.username;

        
        const task = new Task({
            title,
            description,
            points,
            status,
            postedBy
        });

        await task.save();
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


router.get('/tasks', authenticate, async (req, res) => {
    try {
        const tasks = await Task.find({
            status: 'pending', 
            postedBy: { $ne: req.user.username } 
        });

        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/mytasks', authenticate, async (req, res) => {
    try {
        const mytasks = await Task.find({
            status: 'pending', 
            postedBy: { $eq: req.user.username }
        });

        res.json(mytasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.get('/:username/points', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ karmaPoints: user.points });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.patch('/tasks/:taskId/reserve', authenticate, async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (task && task.status === 'pending') { 
            task.reservedBy = req.user.username; 
            task.status = 'reserved';
            await task.save();
            res.json(task);
        } else {
            res.status(400).json({ message: 'Task not available' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


router.patch('/tasks/:taskId/complete', authenticate, async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId);
        if (task && task.status === 'reserved' && task.reservedBy === req.user.username) { 
            task.status = 'completed';
            await task.save();

            
            const transaction = new Transaction({
                from: task.postedBy,
                to: task.reservedBy,
                points: task.points, 
                task: task._id
            });
            await transaction.save();

            const fromUser = await User.findOne({ username: task.postedBy });
            const toUser = await User.findOne({ username: task.reservedBy });

            fromUser.karmaPoints -= task.points;
            toUser.karmaPoints += task.points;

            await fromUser.save();
            await toUser.save();

            res.json(task);
        } else {
            res.status(400).json({ message: 'Task not available or you are not authorized to complete this task' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
