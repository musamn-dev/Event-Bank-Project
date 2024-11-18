import { LightningElement, api, track, wire } from 'lwc';
import getContributorEvents from '@salesforce/apex/EventController.getContributorEvents';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const columns = [
    { label: 'Event Name', fieldName: 'Name', required: true },
    { label: 'Date', fieldName: 'Date__c', type: 'date', typeAttributes: { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }, required: true },
    { label: 'Location', fieldName: 'Location__c', required: true },
    { label: 'Description', fieldName: 'Description__c' },
    {
        type: 'button',
        typeAttributes: {
            label: 'Manage',
            name: 'manage',
            title: 'Manage',
            variant: 'brand',
            alternativeText: 'Manage'
        }
    }
];

export default class ConfigurableEventList extends NavigationMixin(LightningElement) {
    @api eventType; // 'past' or 'upcoming'
    @track events = [];
    @track columns = columns;

    @wire(getContributorEvents)
    wiredEvents({ error, data }) {
        if (data) {
            console.log('data :: ' + data)
            const now = new Date().toISOString();
            this.events = data.filter(event => {
                if (this.eventType === 'past') {
                    return event.Date__c < now;
                } else {
                    return event.Date__c >= now;
                }
            });
        } else if (error) {
            this.showToast('Error', error.body.message, 'error');
        }
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'manage') {
            this.navigateToManagePage(row.Id);
        }
    }

    navigateToManagePage(eventId) {
        // Example navigation to another page
        thisNavigationMixin.Navigate;
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }
}