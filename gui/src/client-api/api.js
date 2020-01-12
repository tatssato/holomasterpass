import { ObjectModel, BasicModel } from 'objectmodel'
import { createKey, createPassword, createSeed } from 'masterpassx-core'
import { connect } from '@holochain/hc-web-client'

const nameArray = ['apple.eye', 'pear.php', 'orange.citrus', 'banana.org', 'not a fruit at all']

const IdentityOM = ObjectModel({
    username: String,
    userkey: String,
});

const AddressHash = BasicModel(String)
    .assert(function isNotBlank(str) { return str.trim().length > 0 })
    .as("AddressHash");
// TODO find out what is the expected length /range of length and characters to expect from a Holochain Hash address

const MasterSeed = BasicModel(String)
    .assert(function isNotBlank(str) { return str.trim().length > 0 })
    .as("MasterSeed");
// TODO add more specific assertion

const PassDetailOM = ObjectModel({
    name: String,
    pw_type: String,
    counter: Number,
});
export default class HoloBridge {
    static current = new ObjectModel({
        IDentry: [IdentityOM],
        IDaddress: [AddressHash],
        MasterKey: [MasterSeed],
    })({})
    static _currentIDentry // cached IdentityOM 
    static _currentIDaddress // just in case save the hash/address of the entry returned by CallZome
    static _currentMasterKey // MasterKey used to actually generate pws
    static _initialPassDetails // Initial Array of passDetails

    static holochain_connection = connect({ url: "ws://127.0.0.1:8888" }) // static single connection object

    static async doZomeCall(args = {}, fxName = 'ping', zomeName = 'passwords', instance = 'test-instance') {
        const { callZome } = await this.holochain_connection
        const result = await callZome(instance, zomeName, fxName)(args)
        console.log('raw JSON result:', result)
        const parsedResultOk = JSON.parse(result).Ok
        return parsedResultOk
    }

    static pingConductor() {
        this.doZomeCall()
        // equivalent to:
        // this.holochain_connection.then(({ callZome, close }) => {
        //     callZome(
        //         'test-instance',
        //         'passwords',
        //         'ping',
        //     )({ args: {} }).then(result => console.log(JSON.parse(result).Ok))
        // })
    }

    static async setIdentity(un = "tats", bk = "1234") {
        const revBk = bk.split("").reverse().join("");
        const newID = new IdentityOM({
            username: un, // user chosen username
            userkey: await MasterPassUtils.generateIdentityKey(un, revBk), // username hashed with reversed brain key using Masterpass Algorithm
        })

        this.current.IDentry = newID
        this._currentMasterKey = await MasterPassUtils.generateIdentityKey(un, bk)

        // TODO handle timeout and window.blur for security
        //setTimeout(()=> this._currentMasterKey = null,20000 ) //timeout the masterkey and demand relogin

        this._currentIDaddress = await this.doZomeCall(newID, 'set_identity')

        console.log(`setID result address: ${this._currentIDaddress}, full IDentry:`, this.current.IDentry)
        // TODO fetch parse and cast returned vector of all known PassDetails for _currentID
        // and set/update entries in local client side map
        // something like:
        // parsedResult.passDetails.map(eachPD=>this._currentPassMap.set(eachPD.address,eachPD))
        this._initialPassDetails = await this.getAllPassDetails()
        this._initialPassDetails = this._initialPassDetails.map(eachUncastPD => new PassDetailOM(eachUncastPD))
        return this._initialPassDetails
    }

    // mock data params are included so the API page can call the fx with no params
    static async savePassDetailEntry(passName = nameArray[Math.floor(Math.random() * nameArray.length)], type = 'medium', c = 1) {

        const newPassDetailEntry = new PassDetailOM({
            name: passName,
            counter: +c,
            pw_type: type,
        })

        const parsedOkResult = await this.doZomeCall(
            { ...newPassDetailEntry, ...this.current.IDentry }, 'create_pass_detail'
        )
        const allPassDetails = await this.getAllPassDetails()
        return { newAddress: parsedOkResult, newPassDetailEntry, allPassDetails }
    }

    static async getAllPassDetails() {
        return await this.doZomeCall(
            { address: this._currentIDaddress }, 'get_all_pass_details_from_identity'
        )
    }
}

export class MasterPassUtils {
    static generatePassFromPD(passDetail) {
        return createPassword(createSeed(
            HoloBridge._currentMasterKey,
            passDetail.name,
            passDetail.counter
        ), passDetail.pw_type
        )
    }

    static generateIdentityKey = async (username, brainkey) => {
        // use MasterPassword Algo for creating User Identity Key from username and brainkey
        return await createKey(username, brainkey)
    }
}