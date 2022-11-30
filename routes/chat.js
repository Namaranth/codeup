const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Room, Chat } = require('../models');
const { nextTick } = require('process');

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const rooms = await Room.findAll({});

        res.render('chatMain', {
            title: "채팅방",
            rooms: rooms
        });
    }catch(error) {
        console.error(error);
        next(error);
    }
});

router.get('/room', (req, res) => {
    res.render('room', {title : "채팅방 생성"});
});

router.post('/room', async(req, res) => {
    try {
        const newRoom = await Room.create({
            title: req.body.title,
            hostSocketId: req.user.id,
            nick: req.user.nick,
        });
        const io = req.app.get('io');
        io.of('/room').emit('newRoom', newRoom);
        res.redirect(`/room/${newRoom._id}`);
    }catch(error) {
        console.error(error);
        next(error);
    }
})


module.exports = router;