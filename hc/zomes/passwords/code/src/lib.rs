#![feature(proc_macro_hygiene)]
#[macro_use]
extern crate hdk;
extern crate hdk_proc_macros;
extern crate serde;
#[macro_use]
extern crate serde_derive;
extern crate serde_json;
#[macro_use]
extern crate holochain_json_derive;

use hdk::{
    entry_definition::ValidatingEntryType,
    error::ZomeApiResult,
    prelude::LinkMatch,
};
use hdk::holochain_core_types::{
    entry::Entry,
    dna::entry_types::Sharing,
};

use hdk::holochain_json_api::{
    json::JsonString,
    error::JsonError
};

use hdk::holochain_persistence_api::{
    cas::content::Address
};

use hdk_proc_macros::zome;

// use wasm_utils::core_types::HashString;

// see https://developer.holochain.org/api/0.0.42-alpha3/hdk/ for info on using the hdk library

// This is a sample zome that defines an entry type "MyEntry" that can be committed to the
// agent's chain via the exposed function create_my_entry

#[derive(Serialize, Deserialize, Debug, DefaultJson,Clone)]
pub struct Identity {
    username: String,
    userkey: String, // generated through the mpw calculate key with the reverse of the user's mpw
}
#[derive(Serialize, Deserialize, Debug, DefaultJson,Clone)]
pub struct PassDetail {
    name: String, // apple.com, my_bank, etc
    counter: usize, // how many times you changed your password
    pw_type: String, // could be enum (diff types of pw based on mpw pw types)
}

// These PassDetailReturn objects should only be returned to the clients, but never saved in the holochain
#[derive(Serialize, Deserialize, Debug, DefaultJson,Clone)]
pub struct PassDetailReturn {
    name: String, // apple.com, my_bank, etc
    counter: usize, // how many times you changed your password
    pw_type: String, // could be enum (diff types of pw based on mpw pw types)
    hc_address: String, // the hc entity address of the associated PassDetail
}

#[zome]
mod passwords {

    #[init]
    fn init() {
        Ok(())
    }

    #[validate_agent]
    pub fn validate_agent(validation_data: EntryValidationData<AgentId>) {
        Ok(())
    }

    #[entry_def]
     fn identity_definition() -> ValidatingEntryType {
        entry!(
            name: "identity",
            description: "this is an entry for the credential",
            sharing: Sharing::Public,
            validation_package: || {
                hdk::ValidationPackageDefinition::Entry
            },  
            validation: | _validation_data: hdk::EntryValidationData<Identity>| {
                Ok(())
            },
            links: [
                to!(
                    "pass_details",
                    link_type: "has_pass_details",
                    validation_package: || {
                        hdk::ValidationPackageDefinition::ChainFull
                    },
                    validation: | _validation_data: hdk::LinkValidationData | {
                        Ok(())
                    }
                )]
        )
    }

    #[entry_def]
    fn pass_details_definition() -> ValidatingEntryType {
       entry!(
           name: "pass_details",
           description: "this is an entry for the meta data for a specific account's password",
           sharing: Sharing::Public,
           validation_package: || {
               hdk::ValidationPackageDefinition::Entry
           },
           validation: | _validation_data: hdk::EntryValidationData<PassDetail>| {
               Ok(())
           }
        )
   }

    #[zome_fn("hc_public")]
    fn ping() -> ZomeApiResult<String> {
        Ok("Pong".to_string())
    }

    #[zome_fn("hc_public")]
    fn set_identity(username: String, userkey: String) -> ZomeApiResult<Address> {
        handle_set_identity(username, userkey)
    }

    #[zome_fn("hc_public")]
    fn create_pass_detail(name: String, counter: usize, pw_type: String, username: String, userkey: String) -> ZomeApiResult<Vec<PassDetailReturn>> {
        handle_create_pass_detail(name, counter, pw_type, username, userkey)
    }

    #[zome_fn("hc_public")]
    fn delete_pass_detail(address: String) -> ZomeApiResult<Address> {
        handle_remove_pass_detail(address)
    }

    #[zome_fn("hc_public")]
    fn get_all_pass_details_from_identity(address: String) -> ZomeApiResult<Vec<PassDetailReturn>> {
        handle_get_all_pass_detail_returns_from_identity(address)
    }

    #[zome_fn("hc_public")]
    fn get_pass_detail(address: Address) -> ZomeApiResult<Option<Entry>> {
        hdk::api::get_entry(&address)
    }
}


pub fn handle_set_identity(username: String, userkey: String) -> ZomeApiResult<Address> {
    let identity = Identity {
        username,
        userkey
    };
    let entry = Entry::App("identity".into(), identity.into());
    let address = hdk::commit_entry(&entry)?;

    Ok(address)
    // Ok(get_all_pass_detail_returns_from_identity(address.to_string())?)
}

pub fn handle_remove_pass_detail(address: String)->ZomeApiResult<Address> {
    // TODO #6 remove the link so that the same password can be recreated later without error
    hdk::remove_entry(&address.into())
}
pub fn handle_create_pass_detail(name: String, counter: usize, pw_type: String, username: String, userkey: String) -> ZomeApiResult<Vec<PassDetailReturn>> {
    let pass_detail = PassDetail {
        name,
        counter,
        pw_type,
    };

    let identity = Identity {
        username,
        userkey
    };
    
    let pass_detail_ref = pass_detail.clone();

    let identity_entry = Entry::App("identity".into(), identity.into());
    let identity_address = hdk::entry_address(&identity_entry)?;
    let pass_detail_entry = Entry::App("pass_details".into(), pass_detail.into());
    let pass_detail_address = hdk::commit_entry(&pass_detail_entry)?;

    // link the identity to the pass detail
    hdk::link_entries(&identity_address, &pass_detail_address, "has_pass_details", "")?;

    // add the new passDetail to the return vector
    // currently pushing the vector of the new pass detail BEFORE it being commited to source chain.
    // are we actually BEFORE the entry is commited or just the link
    // TODO: Only push the newly added vector if the commit is successful
    let mut return_pass_details = handle_get_all_pass_details_from_identity(identity_address.to_string())?;
    return_pass_details.push(pass_detail_ref);

   let return_pass_details_with_address = alter_pass_detail_vec_to_pass_detail_return_vec(return_pass_details)?;

    // return only the vector of all pass details with their address
    Ok(return_pass_details_with_address)
}

pub fn handle_get_all_pass_details_from_identity(address: String) -> ZomeApiResult<Vec<PassDetail>> {
    hdk::utils::get_links_and_load_type(&address.into(), LinkMatch::Exactly("has_pass_details"), LinkMatch::Any)
}

pub fn handle_get_all_pass_detail_returns_from_identity(address: String) -> ZomeApiResult<Vec<PassDetailReturn>> {
    alter_pass_detail_vec_to_pass_detail_return_vec(handle_get_all_pass_details_from_identity(address)?)
}

pub fn alter_pass_detail_vec_to_pass_detail_return_vec(pass_details: Vec<PassDetail>) -> ZomeApiResult<Vec<PassDetailReturn>> {
    let mut return_pass_details_with_address = Vec::new();

    for each_pd in pass_details {
        // Create a vector of PassDetailReturn objects that incldues the entry addresses
        // Uses a helper function that will take in PassDetail and return PassDetailReturn 
        return_pass_details_with_address.push(handle_createa_pass_detail_return(each_pd)?);
    }
    Ok(return_pass_details_with_address)
}

pub fn handle_createa_pass_detail_return(pass_detail: PassDetail) -> ZomeApiResult<PassDetailReturn> {
    let pass_detail_entry = Entry::App("pass_details".into(), pass_detail.clone().into());
    let pass_detail_address = hdk::entry_address(&pass_detail_entry)?;
    let pass_detail_with_address = PassDetailReturn {
        name: pass_detail.name,
        counter: pass_detail.counter,
        pw_type: pass_detail.pw_type,
        hc_address: pass_detail_address.into(),
    };
    Ok(pass_detail_with_address)
}

