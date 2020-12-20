import { LightningElement, wire, } from 'lwc';
import ldsUtils from 'c/ldsUtils';
import { reduceErrors } from 'c/ldsUtils';
import CONTACT_OBJECT from '@salesforce/schema/Contact';
import FIRSTNAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LASTNAME_FIELD from '@salesforce/schema/Contact.LastName';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import TITLE_FIELD from '@salesforce/schema/Contact.Title';
import getContacts from '@salesforce/apex/ContactDelitionController.getContacts';
const COLUMNS = [
    { label: 'FirstName', fieldName: FIRSTNAME_FIELD.fieldApiName, type: 'text' },
    { label: 'LastName', fieldName: LASTNAME_FIELD.fieldApiName, type: 'text' },
    { label: 'Email', fieldName: EMAIL_FIELD.fieldApiName, type: 'text' },
    { label: 'Title', fieldName: TITLE_FIELD.fieldApiName, type: 'text' }
];
export default class ContactList extends LightningElement {
    columns = COLUMNS;
    @wire(getContacts)
    contacts;

    get errors() {
        return (this.contacts.error) ?
            reduceErrors(this.contact.error) : [];
    }
}