import { LightningElement, api, track } from 'lwc';
export default class Paginator extends LightningElement {
     @api
    changeView(str){
        if(str === 'trueprevious'){
            this.template.querySelector('lightning-button.Previous').disabled = true;
        }
        if(str === 'falsenext'){
            this.template.querySelector('lightning-button.Next').disabled = false;
        }
        if(str === 'truenext'){
            this.template.querySelector('lightning-button.Next').disabled = true;
        }
        if(str === 'falseprevious'){
            this.template.querySelector('lightning-button.Previous').disabled = false;
        }
    }
    renderedCallback(){
          this.template.querySelector('lightning-button.Previous').disabled = true;
    }
    previousPaginatorHandler() {
        this.dispatchEvent(new CustomEvent('previous'));
    }

    nextPaginatorHandler() {
        this.dispatchEvent(new CustomEvent('next'));
    }
    firstPaginatorHandler(){
        this.dispatchEvent(new CustomEvent('firstpage'));
    }
    lastPaginatorHandler(){
        this.dispatchEvent(new CustomEvent('lastpage'));
    }
    changePageSizeHandler(event){
        event.preventDefault();
        const sValue = + event.target.value;
        const selectedEvent = new CustomEvent('pagesizechange', { detail: sValue});
        this.dispatchEvent(selectedEvent);
    }
}