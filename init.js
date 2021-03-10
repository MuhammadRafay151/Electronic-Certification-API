const mongoose = require('mongoose');
const user = require('./models/user');
const config = require('config')
async function init() {
    var s1 = new user({
        name: "Rafay",
        email: "muhammadrafay151@gmail.com",
        password: "123123",
        roles: ["SuperAdmin"],
        register_date: Date.now()
    });
    try {
        var r1 = await s1.save()
        console.log(r1)
    }
    catch (err) {
        console.log(r1)
    }

}

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.connect(config.get('database.url'), { useUnifiedTopology: true, useNewUrlParser: true }, () => { console.log("Connected to db") })
init()


