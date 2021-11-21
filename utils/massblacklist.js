const path = require('path');
const prompt = require('prompt-sync')()

function massblacklist(client) {
    var ifstart = prompt('To blacklist enter bl: ')
    if(ifstart == "bl") {
        client.users.fetch(userid).then((result) => {
            theuser = result
            console.log(`Sucessfully added ${theuser.username}#${theuser.discriminator} (${theuser.id})`)
            return massblacklist();
        }).catch(err => {
            console.log('Enter a valid id');
            return massblacklist();
    });
    console.clear();
    var userid = prompt('(Enter end to stop executing this function) Enter user id: ')
var newstr = userid.replace(/,/i, "");
console.log(newstr);

    if(userid == "end") {
        var ifstart = prompt('To blacklist someone enter bl: ')
    }       
    var cKey = 67;
    } else if(ifstart == cKey) {
        console.clear();
        console.log("Ending process...");
        process.exit(1)
    } else {
        var clientx = client
        console.log("Enter bl to blacklist someone! Not anything else!")
        massblacklist(clientx)
    }

}

const client = require('../index.js')

massblacklist(client)
