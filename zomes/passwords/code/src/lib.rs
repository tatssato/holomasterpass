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
    full_name: String,
    key: String, // generated through the mpw calculate key function
}
#[derive(Serialize, Deserialize, Debug, DefaultJson,Clone)]
pub struct PassDetail {
    name: String, // apple.com, my_bank, etc
    counter: usize, // how many times you changed your password
    pw_type: String, // could be enum (diff types of pw based on mpw pw types)
}

#[zome]
mod my_zome {

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
            validation: | _validation_data: hdk::EntryValidationData<Credentials>| {
                Ok(())
            }
        )
    }

    #[entry_def]
    fn domains_definition() -> ValidatingEntryType {
       entry!(
           name: "domain_details",
           description: "this is an entry for the domain details for a specific site",
           sharing: Sharing::Public,
           validation_package: || {
               hdk::ValidationPackageDefinition::Entry
           },
           validation: | _validation_data: hdk::EntryValidationData<DomainDetail>| {
               Ok(())
           }
       )
   }

    #[zome_fn("hc_public")]
    fn create_credentials(entry: Credentials) -> ZomeApiResult<Address> {
        handle_create_credentials(entry)
    }

    #[zome_fn("hc_public")]
    fn create_domain(entry: Domain) -> ZomeApiResult<Option<Entry>> {
        handle_create_domain(entry)
    }

}

pub fn handle_create_credentials(entry: Credentials) -> ZomeApiResult<Address> {
    let entry = Entry::App("credentials".into(), entry.into());
    let address = hdk::commit_entry(&entry)?;
    Ok(address)
}

pub fn handle_create_domain(entry: Domain) -> ZomeApiResult<Address> {
    let entry = Entry::App("domain_details".into(), entry.into());
    let address = hdk::commit_entry(&entry)?;
    Ok(address)
}
