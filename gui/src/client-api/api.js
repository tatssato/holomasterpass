import { ObjectModel } from 'objectmodel'
import { createKey, createPassword, createSeed } from 'masterpassx-core'
import { connect } from '@holochain/hc-web-client'

const nameArray = ['apple.eye','pear.php','orange.citrus','banana.org','not a fruit at all']

const IdentityOM = ObjectModel({
    username: String,
    key: String,
});

const PassDetailOM = ObjectModel({
    name: String,
    pw_type: String,
    counter: Number,
});

// // This should be taken care of automagically by the Zome:
// const IdentityPassDetailLinkOM = ObjectModel({
//     IdentityHash: String,
//     PassDetailHash: String,
// });

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
    static async setIdentity(un="tats",bk="1234") {
        const newID = new IdentityOM({
            username: un, // user chosen username
            key: await generateIdentityKey(un, bk), // username hashed with brain key using Masterpass Algorithm
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
    static async savePassDetailEntry(passName=nameArray[Math.floor(Math.random()*nameArray.length)], type='medium', c=1) {
        const potentialPD = {
            name: passName,
            counter: +c,
            pw_type: type,
        }
        if(!PassDetailOM.test(potentialPD)) 
            return console.warn('bogus potentialPassDetail', potentialPD)

        const newPassEntry = new PassDetailOM(potentialPD)

        // Call the Zome function and pass the result up the chain of promises
        return await this.holochain_connection.then(async ({ callZome, close }) => {
            return await callZome(
                'test-instance',
                'passwords',
                'create_pass_detail',
            )({ ...newPassEntry, ...this._currentIDentry })
                .then(result => {
                    const newAdd = JSON.parse(result).Ok
                    console.log(`Added: ${newAdd}`)
                    this._currentPassMap.set(newAdd,newPassEntry)
                    console.log(this._currentPassMap)
                    return this._currentPassMap
                })
                .catch(err => console.log(err))
        });
    }

    static async callHolo(fxName, args, handlerFx) {

    }
    static generatePassFromPD(passDetail) {
        return createPassword( createSeed(
                        HoloBridge._currentIDentry.key,
                        passDetail.name,
                        passDetail.counter
                    ), passDetail.pw_type
                )
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