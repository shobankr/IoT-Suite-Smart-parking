const SmoochCore = require('smooch-core');
const app = require('./app')
const webhookTriggers = ['message:appUser', 'postback'];
const jwt = require('./jwt');

var smoochCore = new SmoochCore({
        jwt: jwt,
        scope: 'app'
    });

const target = "http://smoochwebhook.azurewebsites.net/webhook";

//List all webhooks
smoochCore.webhooks.list()
    .then((res) => {
        const existingWebhook = res.webhooks.find((w) => w.target === target);

        if (!existingWebhook) {
            return createWebhook(smoochCore, target);
        }

        const hasAllTriggers = webhookTriggers.every((t) => {
            return existingWebhook.triggers.indexOf(t) !== -1;
        });

        if (!hasAllTriggers) {
            updateWebhook(smoochCore, existingWebhook);
        }
    });


//Update persistent menu
smoochCore.menu.configure({
    name: 'ABC Mall Menu',
    items: [{
        type: 'postback',
        text: 'Check In'
    },
    {
        type: 'postback',
        text: 'Search Shops'
    },
    {
        type: 'postback',
        text: 'Get Directions'
    },
    {
        type: 'postback',
        text: 'Report Incident'
    }]
})
.then(() => {
    console.log("added persistent menu");
});

smoochCore.menu.get().then((data) => {
    console.log(data);
});




//Create webhooks
function createWebhook(smoochCore, target) {
    return smoochCore.webhooks.create({
        target,
        triggers: webhookTriggers
    })
        .then((res) => {
            console.log('Smooch webhook created with target', res.webhook.target);
        })
        .catch((err) => {
            console.error('Error creating Smooch webhook:', err);
            console.error(err.stack);
        });
}

//update webhook
function updateWebhook(smoochCore, existingWebhook) {
    return smoochCore.webhooks.update(existingWebhook._id, {
        triggers: webhookTriggers
    })
        .then((res => {
            console.log('Smooch webhook updated with missing triggers', res.webhook.target);
        })
            .catch((err) => {
                console.error('Error updating Smooch webhook:', err);
                console.error(err.stack);
            }));
}






