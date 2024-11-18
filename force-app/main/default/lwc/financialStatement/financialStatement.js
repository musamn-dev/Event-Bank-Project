import { LightningElement, track, wire } from 'lwc';
import getTransactions from '@salesforce/apex/TransactionController.getTransactions';
import getEventId from '@salesforce/apex/GlobalVariableController.getEventId';

export default class FinancialStatement extends LightningElement {
    @track transactions;
    @track columns = [
        { label: 'Date', fieldName: 'CreatedDate', type: 'date' },
        { label: 'Description', fieldName: 'Description__c', type: 'text' },
        { label: 'Amount', fieldName: 'Amount__c', type: 'currency' }
    ];
    @track eventId;

    @wire(getEventId)
    wiredEventId({ error, data }) {
        if (data) {
            this.eventId = data;
            this.loadTransactions();
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    loadTransactions() {
        getTransactions({ eventId: this.eventId })
            .then(result => {
                this.transactions = result;
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            }),
        );
    }
}