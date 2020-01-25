import { ObjectModel, BasicModel, MapModel } from 'objectmodel'
import { createKey, createPassword, createSeed } from 'masterpassx-core'
import { connect } from '@holochain/hc-web-client'
// import {Encoding} from '@holochain/hcid-js'  // TODO learn how to use this to generate HASHs the same way that the zome does

const WEB_SOCKET_URL = "ws://holoapp.onezoom.in:8888" // TODO get this running on wss
const nameArray = ['apple.eye', 'pear.php', 'orange.citrus', 'banana.org', 'not a fruit at all']

const IdentityOM = ObjectModel({
    username: String,
    userkey: String,
})


const AddressHash = BasicModel(String)
    .assert(function is46charsLong(str) { return str.trim().length === 46 })  //eg: QmYeHebtkhmRnJXqvXoU2W2FZDKvBDNcxqqv5BYK2L8iYU
    .as("AddressHash")
// TODO double check what is the expected / range of length and characters to expect from a Holochain Hash address

const MasterSeed = BasicModel(String)
    .assert(function isValidMasterSeed(str) { return str.trim().length > 0 })
    .as("MasterSeed")
// TODO add more specific assertion

const PassDetailOM = ObjectModel({
    name: String,
    pw_type: String,
    counter: Number,
    hc_address: [AddressHash], // depends on the zome to add the address into the returned object vector
})
export default class HoloBridge {
    static current = new ObjectModel({
        IDentry: [IdentityOM],
        IDaddress: [AddressHash], //  save the hash/address of the identity entry returned by CallZome
        MasterKey: [MasterSeed],
        PassDetailsMap: [MapModel(String,PassDetailOM)],
    })({})

    static holochain_connection // static single connection object

    static async doZomeCall(args = {}, fxName = 'ping', zomeName = 'passwords', instance = 'test-instance') {
        if(!this.holochain_connection) this.holochain_connection = connect({ url: WEB_SOCKET_URL })
        const { callZome } = await this.holochain_connection
        
        const result = await callZome(instance, zomeName, fxName)(args)
        console.log('raw JSON result:', result)
        
        // by default hc will return the response "on" the Ok prop of the returned JSON
        const parsedResultOk = JSON.parse(result).Ok
        return parsedResultOk
    }

    static pingConductor() {
        this.doZomeCall()
        /**********
         **  this call is equivalent to:
                this.holochain_connection.then(({ callZome, close }) => {
                    callZome(
                        'test-instance',
                        'passwords',
                        'ping',
                    )({ args: {} }).then(result => console.log(JSON.parse(result).Ok))
                })
         *************/
        
    }

    static async setIdentity(un = "tats", bk = "1234") {
        const revBk = bk.split("").reverse().join("")
        const newID = new IdentityOM({
            username: un, // user chosen username
            userkey: await MasterPassUtils.generateIdentityKey(un, revBk), // username hashed with reversed brain key using Masterpass Algorithm
        })

        // const enc = await new Encoding('hcs0')
        // let expectedAddress= enc.encode(newID)
        // console.log(expectedAddress)

        this.current.IDentry = newID
        this.current.MasterKey = await MasterPassUtils.generateIdentityKey(un, bk)

        // TODO handle timeout and window.blur for security
        //setTimeout(()=> this.current.MasterKey = null,20000 ) //timeout the masterkey and demand relogin

        this.current.IDaddress = await this.doZomeCall(newID, 'set_identity')

        console.log(`setID result address: ${this.current.IDaddress}, full IDentry:`, this.current.IDentry)
        // TODO fetch parse and cast returned vector of all known PassDetails for _currentID
        // and set/update entries in local client side map
        // something like:
        // parsedResult.passDetails.map(eachPD=>this._currentPassMap.set(eachPD.address,eachPD))
        const tempPassDetailArray = await this.getAllPassDetails()
        this.setPassDetailsMap(tempPassDetailArray)
        return Array.from(this.current.PassDetailsMap.values())
    }

    /**
     * Currently this will use the name of each PassDetail as keys in the map (so no duplicate names possible)
     * TODO we'd prefer to map on the hcAddressHash if we can manage to get it onto the return object
     * @param {*} tempPassDetailArray 
     */
    static setPassDetailsMap(tempPassDetailArray){
        this.current.PassDetailsMap = new Map(tempPassDetailArray.map(eachUncastPD => [eachUncastPD.hc_address||eachUncastPD.name,new PassDetailOM(eachUncastPD)]))
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
        this.setPassDetailsMap(parsedOkResult) // optimistic ui update
        const allPassDetails  =  Array.from(HoloBridge.current.PassDetailsMap.values())
        return { allPassDetails }
    }

    static async getAllPassDetails() {
        return await this.doZomeCall(
            { address: this.current.IDaddress }, 'get_all_pass_details_from_identity'
        )
    }

    static async deletePassDetailEntry(address) {
        console.log(`Deleting PassDetail:  ${address}`)
        await this.doZomeCall(
            { address: address }, 'delete_pass_detail'
        )
        return this.getAllPassDetails()
    }
}

export class MasterPassUtils {
    static generatePassFromPD(passDetail) {
        if(!HoloBridge.current.MasterKey) return console.warn('undefined MasterKey')
        return createPassword(createSeed(
            HoloBridge.current.MasterKey,
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