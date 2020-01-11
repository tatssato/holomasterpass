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

const generateIdentityKey = async (username, brainkey) => {
    // use MasterPassword Algo for creating User Identity Key from username and brainkey
    return await createKey(username, brainkey);
}

export default class HoloBridge {
    static _currentIDentry // cached IdentityOM 
    static _currentIDaddress // just in case save the hash/address of the entry returned by CallZome
    static _currentPassMap = new Map() // local cache of all pass details

    static holochain_connection = connect({ url: "ws://127.0.0.1:8888" }) // static single connection object

    static pingConductor() {
        this.holochain_connection.then(({ callZome, close }) => {
            callZome(
                'test-instance',
                'passwords',
                'hello_holo',
            )({ args: {} }).then(result => console.log(JSON.parse(result).Ok))
        })
    }
    static async setIdentity() {
        const newID = new IdentityOM({
            username: "tats",
            key: await generateIdentityKey("tats", "1234"),
        })
        console.log(newID)
        this._currentIDentry = newID

        this.holochain_connection.then(({ callZome, close }) => {
            callZome(
                'test-instance',
                'passwords',
                'create_identities',
            )(newID)
                .then(result => {
                    const parsedResult = JSON.parse(result)
                    this._currentIDaddress = parsedResult.Ok
                    console.log(`setID result address: ${this._currentIDaddress}`)
                    // TODO parse and cast returned vector of all known PassDetails for _currentID
                    // and set/update entries in local client side map
                    // something like:
                    // parsedResult.passDetails.map(eachPD=>this._currentPassMap.set(eachPD.address,eachPD))
                })
                .catch(err => console.log(err))
        })
    }
    static async savePassDetailEntry() {
        const nameArray = ['apple.eye','pear.php','orange.citrus','banana.org','not a fruit at all']
        const idx = Math.floor(Math.random()*nameArray.length);
        const newPassEntry = new PassDetailOM({
            name: nameArray[idx],
            counter: 1,
            pw_type: 'medium',
        })

        this.holochain_connection.then(({ callZome, close }) => {
            callZome(
                'test-instance',
                'passwords',
                'create_pass_detail',
            )({ ...newPassEntry, ...this._currentIDentry })
                .then(result => {
                    const newAdd = JSON.parse(result).Ok
                    console.log(`Added: ${newAdd}`)
                    this._currentPassMap.set(newAdd,newPassEntry)
                    console.log(this._currentPassMap)
                })
                .catch(err => console.log(err))
        });


    }
    static async callHolo(fxName, args, handlerFx) {

    }
    static getAllPassDetails() {
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