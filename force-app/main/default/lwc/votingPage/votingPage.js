import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { LightningElement, wire } from 'lwc';
import getCampaignList from '@salesforce/apex/VotingController.getCampaignList';
import getNominationList from '@salesforce/apex/VotingController.getNominationList';
import createVote from '@salesforce/apex/VotingController.createVote';
import getContactList from '@salesforce/apex/VotingController.getContactList';

export default class VotingPage extends LightningElement {
    queryTerm;
    contacts;
    contactsInNominations;
    nominations;
    campaign;
    voterEmail;
    selectedNomination;
    selectedCampaign;
    posibleVotes = {};
    updateContacts = false;
    hasVoted = false;
    connectedCallback() {
        getCampaignList().then(result => {
            this.campaign = result;
            getNominationList({ campaign: this.campaign.Id }).then(result => {
                this.nominations = result.slice();
                getContactList({ nominations: this.nominations }).then(result => {
                    this.contactsInNominations = result;
                    this.nominations.forEach(nominationItem => {
                        nominationItem.contacts = this.contactsInNominations[nominationItem.Id];
                    });
                    this.updateContacts = true;
                });
            });

        });

    }

    handleEmailChange(evt) {
        this.voterEmail = evt.target.value;
    }

    handleClickButton() {
        if (!this.voterEmail) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Fill all required fields!',
                    variant: 'error',
                })
            );
        } else {

            console.log('this.voterEmail ' + this.voterEmail);
            createVote({ finalVotes: this.posibleVotes, email: this.voterEmail })
                .then(() => {
                    this.hasVoted = true;
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: error.body.message,
                            variant: 'error',
                        })
                    );
                });
        }
    }

    handleClickViewForm(evt) {
        let selectedContact = evt.currentTarget.dataset.id1;
        let nomination = evt.currentTarget.dataset.id2;
        console.log('nomination: ' + nomination);
        console.log('this.selectedContact ' + selectedContact);
        this.posibleVotes[nomination] = selectedContact;
        console.log('this.posibleVotes: ', this.posibleVotes);
    }

}