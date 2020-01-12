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
}) // TODO add .assert();


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
    static _currentMasterKey // MasterKey used to actually generate pws

    static holochain_connection = connect({ url: "ws://127.0.0.1:8888" }) // static single connection object

    static pingConductor() {
        this.holochain_connection.then(({ callZome, close }) => {
            callZome(
                'test-instance',
                'passwords',
                'ping',
            )({ args: {} }).then(result => console.log(JSON.parse(result).Ok))
        })
    }

    static async setIdentity(un="tats",bk="1234") {
        const revBk = bk.split("").reverse().join("");
        const newID = new IdentityOM({
            username: un, // user chosen username
            userkey: await generateIdentityKey(un, revBk), // username hashed with reversed brain key using Masterpass Algorithm
        })
       
        this._currentIDentry = newID
        this._currentMasterKey = await generateIdentityKey(un,bk);
        
        // TODO handle timeout and window.blur for security
        //setTimeout(()=> this._currentMasterKey = null,20000 ) //timeout the masterkey and demand relogin

        const { callZome } = await this.holochain_connection
        
        const result = await callZome('test-instance', 'passwords','set_identity')(newID)
        console.log('Set Identity Raw Result:',result)
        const parsedResult = JSON.parse(result)
        this._currentIDaddress = parsedResult.Ok
        console.log(`setID result address: ${this._currentIDaddress}, full IDentry:`,this._currentIDentry)
        // TODO parse and cast returned vector of all known PassDetails for _currentID
        // and set/update entries in local client side map
        // something like:
        // parsedResult.passDetails.map(eachPD=>this._currentPassMap.set(eachPD.address,eachPD))
        return result
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
                        HoloBridge._currentMasterKey,
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