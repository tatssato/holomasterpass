// const { connect } = require("./hc-web-client/hc-web-client-0.5.1.browser.min");

const { Model, ObjectModel } = objectmodel;

const IdentityOM = ObjectModel({
    username: String,
    key: String,
});

const generateIdentityKey=(username,brainkey)=>{
    return `fancyHashedKeyFor${username}${brainkey}`;
}
const tatsID = new IdentityOM({username:"tats",key:generateIdentityKey("tats","1234")});

console.log(IdentityOM,tatsID);

class HoloBridge {
    static pingConductor(){

    }
    static saveIdentity(){

    }
}