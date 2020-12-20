import { LightningElement, wire , track} from 'lwc';
import TITLE_FIELD from '@salesforce/schema/Contact.Title'
import FIRSTNAME_FIELD from '@salesforce/schema/Contact.FirstName';
import LASTNAME_FIELD from '@salesforce/schema/Contact.LastName';
import EMAIL_FIELD from '@salesforce/schema/Contact.Email';
import DEPARTMENT_FIELD from '@salesforce/schema/Contact.Department';
import getContacts from '@salesforce/apex/ContactDelitionController.getContacts';
import contactDelition from '@salesforce/apex/ContactDelitionController.contactDelition';
import getNext from '@salesforce/apex/ContactDelitionController.getNext';
import getPrevious from '@salesforce/apex/ContactDelitionController.getPrevious';
import totalRecords from '@salesforce/apex/ContactDelitionController.totalRecords';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
const COLUMNS = [
    { label: 'First Name', fieldName: FIRSTNAME_FIELD.fieldApiName, type: 'text' },
    { label: 'Last Name', fieldName: LASTNAME_FIELD.fieldApiName, type: 'text' },
    { label: 'Email', fieldName: EMAIL_FIELD.fieldApiName, type: 'text' },
    { label: 'Title', fieldName: TITLE_FIELD.fieldApiName, type: 'text' },
    { label: 'Department', fieldName: DEPARTMENT_FIELD.fieldApiName, type: 'text' }
];
export default class ContactDelition extends LightningElement {
    columns = COLUMNS;
    @track vOffset = 0;
    @track vTotalRecords;
    @track pageSize = 10;
    @track contacts;
    @wire(getContacts, { vOffset: '$vOffset', vPagesize: '$pageSize' })
    wiredContacts(response) {
        this.wiredContactResult = response;
        this.contacts = response.data;
        
    }
    connectedCallback() {
        setTimeout(() => {
            this.isLoaded = true;
        }, 0);
        totalRecords().then(result=>{
            this.vTotalRecords = result;
        });
    }
    handleCheckBoxClick(){
        let el = this.template.querySelector('lightning-datatable');
        let selected = el.getSelectedRows();
        return selected
    }
    deleteContacts(){
        contactDelition({
            contactsList: this.handleCheckBoxClick()
        }).then(result => {
            this.contacts = null;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Contacts successfully deleted!',
                    message: result,
                    variant: 'success',
                }),
            );
            return refreshApex(this.wiredContactResult);
        });
    }
    previousControllerHandler(){
        getPrevious({vOffset: this.vOffset, vPagesize: this.pageSize}).then(result=>{
            this.vOffset = result;
            if(this.vOffset === 0){
                this.template.querySelector('c-paginator').changeView('trueprevious');
            }
            this.template.querySelector('c-paginator').changeView('falsenext');
        });
    }
    nextControllerHandler(){
        getNext({vOffset: this.vOffset, vPagesize: this.pageSize}).then(result=>{
            this.vOffset = result;
            if(this.vOffset + this.pageSize > this.vTotalRecords){
                this.template.querySelector('c-paginator').changeView('truenext');
            }
            this.template.querySelector('c-paginator').changeView('falseprevious');
        });
    }
    changeControllerHandler(event){
        const det = event.detail;
        this.pageSize = det;
    }
    firstPageControllerHandler(){
        this.vOffset = 0;
        this.template.querySelector('c-paginator').changeView('trueprevious');
        this.template.querySelector('c-paginator').changeView('falsenext');
    }
    lastPageControllerHandler(){
        this.vOffset = this.vTotalRecords - (this.vTotalRecords)%(this.pageSize);
        this.template.querySelector('c-paginator').changeView('falseprevious');
        this.template.querySelector('c-paginator').changeView('truenext');
    }
}
