'use strict'
var express = require('express');
var storage = require('node-persist');
var dateFormat = require('dateformat');
const smoochBot = require('smooch-bot');
const MemoryLock = smoochBot.MemoryLock;
const SmoochApiStore = smoochBot.SmoochApiStore;
const SmoochApiBot = smoochBot.SmoochApiBot;
const StateMachine = smoochBot.StateMachine;
const SmoochCore = require('smooch-core');
const jwt = require('../jwt');
const lock = new MemoryLock();
const script = require('../script');



const store = new SmoochApiStore({
    jwt
});

class BetterSmoochApiBot extends SmoochApiBot {
    constructor(options) {
        super(options);
    }

    sendImage(imageFileName) {
        const api = this.store.getApi();
        let message = Object.assign({
            role: 'appMaker'
        }, {
                name: this.name,
                avatarUrl: this.avatarUrl
            });
        var real = fs.realpathSync(imageFileName);
        let source = fs.readFileSync(real);

        return api.conversations.uploadImage(this.userId, source, message);
    }
}

const name = 'ABC Mall';
const avatarUrl = 'http://smoochwebhook.azurewebsites.net/images/avatar.png';

var router = express.Router();

//Only POST
router.post('/', function (req, res, next) {
    var isPostback = req.body.trigger == "postback";
    var msg = '';

    const appUser = req.body.appUser;
    const userId = appUser.userId || appUser._id;
    const stateMachine = new StateMachine({
        script,
        bot: new BetterSmoochApiBot({
            name,
            avatarUrl,
            lock,
            store,
            userId
        })
    });

    if (!isPostback) {
        const messages = req.body.messages.reduce((prev, current) => {
            if (current.role === 'appUser') {
                prev.push(current);
            }
            return prev;
        }, []);

        if (messages.length === 0 && !isTrigger) {
            return res.end();
        }

        msg = messages[0];
    } else {
        msg = req.body.postbacks[0];
        msg.text = msg.action.text;

        switch (msg.action.payload) {
            case 'check_in':
                console.log("Check in");
                break;
            default:
                break;
        }
    }


    stateMachine.receiveMessage(msg)
        .then(() => res.end())
        .catch((err) => {
            console.error('SmoochBot error:', err);
            console.error(err.stack);
            res.end();
        });
});


router.post('/SendMessage', function (req, res, next) {
    var id = req.body.id;
    var message = req.body.message;

    console.log("id " + id);
    console.log("message" + message);
    var smoochCore = new SmoochCore({
        jwt: jwt,
        scope: 'app'
    });


    smoochCore.appUsers.sendMessage(id, {
        text: message,
        role: 'appMaker'
    }).catch(function (error) {
        console.log(error);
    });

    res.end();
});


module.exports = router;