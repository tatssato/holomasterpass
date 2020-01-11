import { Model, ObjectModel } from 'objectmodel'
import { createKey } from 'masterpassx-core'
import { connect } from '@holochain/hc-web-client'
import { Encoding } from '@holochain/hcid-js'



// const { connect } = require("./hc-web-client/hc-web-client-0.5.1.browser.min")
const IdentityOM = ObjectModel({
    username: String,
    key: String,
});

const PassDetailOM = ObjectModel({
    name: String,
    counter: Number,
    pw_type: String,
});

const IdentityPassDetailLinkOM = ObjectModel({
    IdentityHash: String,
    PassDetailHash: String,
});

const generateIdentityKey= async (username,brainkey)=>{
    // use MasterPassword Algo for creating User Identity Key from username and 
    const newKey = await createKey(username, brainkey);
    return `fancyHashedKey::${newKey}`;
}




export default class HoloBridge {
    static _myIDentry // cached IdentityOM 
    static _myIDhash // HOLO hash of _myIDentry

    static pingConductor(){

    }
    static async saveIdentity(){
        const newID = new IdentityOM({
            username:"tats",
            key:await generateIdentityKey("tats","1234"),
        });
        console.log(newID)
        this._myIDentry=newID


        const enc = await new Encoding('hcs0')

        this._myIDhash=`HASHED${JSON.stringify(this._myIDentry)}HASHED`
        // TODO figure out hcid:: enc.encode(new Uint8Array(JSON. stringify(this._myIDentry))
        console.log(this._myIDhash)
        // console.log(enc.encode(Uint8Array.from(()=>JSON.stringify(this._myIDentry))))
    }
    static savePassDetailEntry(){
        const newPassEntry = new PassDetailOM({
            name: 'apple',
            counter: 1,
            pw_type: 'medium',
        })
        const newPassHash = this.generateHoloHash(newPassEntry)
        console.log(newPassHash)
        console.log(newPassEntry)

        this.saveIdentityPassDetailLinkEntry(this._myIDhash,newPassHash)
    }   
    static saveIdentityPassDetailLinkEntry(IDHash,passHash){
        console.log('saving link:')
        console.log(IDHash,passHash)
    }   

    static getAllPassDetails(){
        const retArray = [
            new PassDetailOM({
                name: 'apple',
                counter: 1,
                pw_type: 'medium',
            }),
            new PassDetailOM({
                name: 'pear',
                counter: 1,
                pw_type: 'medium',
            }),
            new PassDetailOM({
                name: 'less fruity password',
                counter: 1,
                pw_type: 'medium',
            }),
        ]
        // TODO await call to HoloZome
        return retArray;
    }
}