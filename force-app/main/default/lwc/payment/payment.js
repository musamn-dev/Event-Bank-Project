import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import createTransaction from '@salesforce/apex/TransactionController.createTransaction';
import getEventId from '@salesforce/apex/GlobalVariableController.getEventId';
import getAccountBalance from '@salesforce/apex/AccountController.getAccountBalance';

export default class Payment extends LightningElement {
    @track description;
    @track amount;
    @track eventId;
    @track balance;

    @wire(getEventId)
    wiredEventId({ error, data }) {
        if (data) {
            this.eventId = data;
            this.loadAccountBalance();
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    loadAccountBalance() {
        getAccountBalance({ eventId: this.eventId })
            .then(balance => {
                this.balance = balance;
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    handleDescriptionChange(event) {
        this.description = event.target.value;
    }

    handleAmountChange(event) {
        this.amount = event.target.value;
    }

    handlePayment() {
        createTransaction({ eventId: this.eventId, amount: this.amount, description: this.description, type: 'Payment' })
            .then(() => {
                this.showToast('Success', 'Payment successful', 'success');
                this.loadAccountBalance();
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