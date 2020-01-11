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

// see https://developer.holochain.org/api/0.0.42-alpha3/hdk/ for info on using the hdk library

// This is a sample zome that defines an entry type "MyEntry" that can be committed to the
// agent's chain via the exposed function create_my_entry

#[derive(Serialize, Deserialize, Debug, DefaultJson,Clone)]
pub struct Identity {
    username: String,
    key: String, // generated through the mpw calculate key function
}
#[derive(Serialize, Deserialize, Debug, DefaultJson,Clone)]
pub struct PassDetail {
    name: String, // apple.com, my_bank, etc
    counter: usize, // how many times you changed your password
    pw_type: String, // could be enum (diff types of pw based on mpw pw types)
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
    fn create_identities(username: String, key: String) -> ZomeApiResult<Address> {
        handle_create_identities(username, key)
    }

    #[zome_fn("hc_public")]
    pub fn hello_holo() -> ZomeApiResult<String> {
        Ok("Hello Holo".into())
    }

    #[zome_fn("hc_public")]
    fn create_pass_detail(name: String, counter: usize, pw_type: String, username: String, key: String) -> ZomeApiResult<Address> {
        handle_create_pass_detail(name, counter, pw_type, username, key)
    }
}

pub fn handle_create_identities(username: String, key: String) -> ZomeApiResult<Address> {
    let identity = Identity {
        username,
        key
    };
    let entry = Entry::App("identity".into(), identity.into());
    let address = hdk::commit_entry(&entry)?;
    Ok(address)
}

pub fn handle_create_pass_detail(name: String, counter: usize, pw_type: String, username: String, key: String) -> ZomeApiResult<Address> {
    let pass_detail = PassDetail {
        name,
        counter,
        pw_type
    };
    let identity = Identity {
        username,
        key
    };
    let identity_address = Entry::App("identity".into(), identity.into());
    let identity_hash = hdk::entry_address(&identity_address)?;
    let pass_detail_entry = Entry::App("pass_details".into(), pass_detail.into());
    let pass_detail_address = hdk::commit_entry(&pass_detail_entry)?;

    hdk::link_entries(&identity_hash, &pass_detail_address, "has_pass_details", "")?;
    Ok(pass_detail_address)
}

// pub fn handle_get_all_pass_details_from_identity(username: String, key: String) -> ZomeApiResult<Vec<ZomeApiResult<Entry>>> {
//     let identity = Identity {
//         username,
//         key
//     };
//     let identity_address = Entry::App("identity".into(), identity.into());
//     let identity_hash = hdk::entry_address(&identity_address)?;
//     hdk::utils::get_links_and_load_type(&identity_hash, LinkMatch::Exactly("has_pass_details"), LinkMatch::Any);


// }
