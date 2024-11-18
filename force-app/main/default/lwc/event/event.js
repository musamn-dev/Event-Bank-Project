import { LightningElement, track, wire } from 'lwc';
import getEvents from '@salesforce/apex/EventController.getEvents';
import updateEvents from '@salesforce/apex/EventController.updateEvents';
import createEvent from '@salesforce/apex/EventController.createEvent';
import deleteEvent from '@salesforce/apex/EventController.deleteEvent';
import upsertEvent from '@salesforce/apex/GlobalVariableController.upsertEvent';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';

const upcomingColumns = [
    { label: 'Event Name', fieldName: 'Name', editable: true, required: true },
    { label: 'Date', fieldName: 'Date__c', type: 'date', typeAttributes: { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }, editable: true, required: true },
    { label: 'Location', fieldName: 'Location__c', editable: true, required: true },
    { label: 'Description', fieldName: 'Description__c', editable: true },
    {
        type: 'button-icon',
        typeAttributes: {
            iconName: 'utility:delete',
            name: 'delete',
            title: 'Delete',
            variant: 'border-filled',
            alternativeText: 'Delete'
        },
        initialWidth: 75
    },
    {
        type: 'button',
        typeAttributes: {
            label: 'Manage',
            name: 'manage',
            title: 'Manage',
            variant: 'brand',
            alternativeText: 'Manage'
        },
        initialWidth: 100
    }
];

const pastColumns = [
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
        },
        initialWidth: 100
    }
];

export default class EventDatatable extends NavigationMixin(LightningElement) {
    @track events;
    @track upcomingEvents = [];
    @track pastEvents = [];
    @track upcomingColumns = upcomingColumns;
    @track pastColumns = pastColumns;
    @track draftValues = [];
    @track isModalOpen = false;
    @track isDeleteModalOpen = false;
    @track isSaveDisabled = true;
    @track newEvent = {
        Name: '',
        Date__c: '',
        Location__c: '',
        Description__c: ''
    };
    @track eventToDelete;
    @track minDate;

    connectedCallback() {
        this.minDate = new Date().toISOString().slice(0, 16);
    }

    @wire(getEvents)
    wiredEvents(result) {
        this.wiredEventsResult = result;
        if (result.data) {
            this.events = result.data;
            this.splitEvents();
        } else if (result.error) {
            this.showToast('Error', result.error.body.message, 'error');
        }
    }

    splitEvents() {
        const now = new Date().toISOString();
        this.upcomingEvents = this.events.filter(event => event.Date__c >= now);
        this.pastEvents = this.events.filter(event => event.Date__c < now);
    }

    handleInputChange(event) {
        const field = event.target.dataset.id;
        this.newEvent[field] = event.target.value;
        this.checkSaveButtonState();
    }

    checkSaveButtonState() {
        const { Name, Date__c, Location__c } = this.newEvent;
        this.isSaveDisabled = !(Name && Date__c && Location__c);
    }

           handleSave(event) {
           const updatedFields = event.detail.draftValues;

           updateEvents({ data: updatedFields })
               .then(() => {
                   this.showToast('Success', 'Events updated successfully', 'success');
                   this.draftValues = [];
                   return refreshApex(this.wiredEventsResult);
               })
               .catch(error => {
                   this.showToast('Error', error.body.message, 'error');
               });
       }

       handleNew() {
           this.isModalOpen = true;
       }

       closeModal() {
           this.isModalOpen = false;
       }

       saveNewEvent() {
           createEvent({ event: this.newEvent })
               .then(() => {
                   this.showToast('Success', 'Event created successfully', 'success');
                   this.isModalOpen = false;
                   return refreshApex(this.wiredEventsResult);
               })
               .catch(error => {
                   this.showToast('Error', error.body.message, 'error');
               });
       }

       handleRowAction(event) {
           const actionName = event.detail.action.name;
           const row = event.detail.row;
           if (actionName === 'delete') {
               this.eventToDelete = row;
               this.isDeleteModalOpen = true;
           } else if (actionName === 'manage') {
                upsertEvent({eventId: row.Id})
                .then(() => {
                    console.log('event upsert :: ' + row.Id);
                });
               this.navigateToManagePage(row.Id);
           }
       }

       closeDeleteModal() {
           this.isDeleteModalOpen = false;
           this.eventToDelete = null;
       }

       confirmDelete() {
           deleteEvent({ eventId: this.eventToDelete.Id })
               .then(() => {
                   this.showToast('Success', 'Event deleted successfully', 'success');
                   this.isDeleteModalOpen = false;
                   this.eventToDelete = null;
                   return refreshApex(this.wiredEventsResult);
               })
               .catch(error => {
                   this.showToast('Error', error.body.message, 'error');
               });
       }

       navigateToManagePage(eventId) {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'Manage__c',
                eventId: eventId
          }
        });
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