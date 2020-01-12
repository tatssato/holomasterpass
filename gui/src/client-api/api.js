import { ObjectModel } from 'objectmodel'
import { createKey, createPassword, createSeed } from 'masterpassx-core'
import { connect } from '@holochain/hc-web-client'

const nameArray = ['apple.eye','pear.php','orange.citrus','banana.org','not a fruit at all']

const IdentityOM = ObjectModel({
    username: String,
    userkey: String,
});

const AddressModel = ObjectModel({
    address: String,
});


const PassDetailOM = ObjectModel({
    name: String,
    pw_type: String,
    counter: Number,
});

const generateIdentityKey = async (username, brainkey) => {
    // use MasterPassword Algo for creating User Identity Key from username and brainkey
    return await createKey(username, brainkey);
}

export default class HoloBridge {
    static _currentIDentry // cached IdentityOM 
    static _currentIDaddress // just in case save the hash/address of the entry returned by CallZome

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
            userkey: await generateIdentityKey(un, bk), // username hashed with brain key using Masterpass Algorithm
        })
        
        this._currentIDentry = newID

        const { callZome } = await this.holochain_connection
        const result = await callZome(
            'test-instance',
            'passwords',
            'set_identity',
        )(newID)

        const id = JSON.parse(result).Ok
        this._currentIDaddress = id
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
        const { callZome } = await this.holochain_connection
        const result = await callZome(
            'test-instance',
            'passwords',
            'create_pass_detail',
        )({ ...newPassEntry, ...this._currentIDentry })

        const newAdd = JSON.parse(result).Ok
        return { newAdd, newPassEntry }
    }

    static generatePassFromPD(passDetail) {
        return createPassword( createSeed(
                        HoloBridge._currentIDentry.key,
                        passDetail.name,
                        passDetail.counter
                    ), passDetail.pw_type
                )
    }

    static async getAllPassDetails() {
        const { callZome } = await this.holochain_connection

        const result = await callZome(
            'test-instance',
            'passwords',
            'get_all_pass_details_from_identity',
        )({ address: this._currentIDaddress })

        const passDetailList = JSON.parse(result).Ok
        console.log({ passDetailList })
        return passDetailList
    }
}