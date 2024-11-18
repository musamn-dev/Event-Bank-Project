import { LightningElement, wire, track } from 'lwc';
import getChecklistItems from '@salesforce/apex/ChecklistItemController.getChecklistItems';
import updateChecklistItem from '@salesforce/apex/ChecklistItemController.updateChecklistItem';
import createChecklistItem from '@salesforce/apex/ChecklistItemController.createChecklistItem';
import deleteChecklistItem from '@salesforce/apex/ChecklistItemController.deleteChecklistItem';
import getEventIdForCurrentUser from '@salesforce/apex/ChecklistController.getEventIdForCurrentUser';
import getCurrentUserRole from '@salesforce/apex/ChecklistController.getCurrentUserRole';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

export default class Checklist extends LightningElement {
    @track checklistItems = [];
    @track error;
    @track filter = 'all'; // all, complete, incomplete
    @track eventId;
    @track userRole;
    @track isModalOpen = false;
    @track newItemName = '';
    draftValues = [];

    wiredChecklistItemsResult;

    connectedCallback() {
        this.initializeComponent();
    }

    async initializeComponent() {
        try {
            this.eventId = await getEventIdForCurrentUser();
            console.log('Event ID:', this.eventId);
            this.userRole = await getCurrentUserRole({ eventId: this.eventId });
            console.log('User Role:', this.userRole);
        } catch (error) {
            this.error = error;
            console.error('Error initializing component:', error);
        }
    }

    @wire(getChecklistItems, { eventId: '$eventId' })
    wiredChecklistItems(result) {
        this.wiredChecklistItemsResult = result;
        const { error, data } = result;
        if (data) {
            this.checklistItems = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.checklistItems = [];
            console.error('Error fetching checklist items:', error);
        }
    }

    get filteredChecklistItems() {
        if (this.filter === 'complete') {
            return this.checklistItems.filter(item => item.Complete__c);
        } else if (this.filter === 'incomplete') {
            return this.checklistItems.filter(item => !item.Complete__c);
        }
        return this.checklistItems;
    }

    handleFilterChange(event) {
        this.filter = event.target.value;
    }

    handleCellChange(event) {
        const draftValues = event.detail.draftValues;
        console.log('Draft Values:', draftValues);

        // Call the Apex method to update the checklist items
        updateChecklistItem({ items: draftValues })
            .then(() => {
                console.log('Update successful');
                this.showToast('Success', 'Checklist items updated successfully', 'success');
                this.draftValues = [];
                return refreshApex(this.wiredChecklistItemsResult);
            })
            .catch(error => {
                console.error('Error updating checklist items:', error);
                this.showToast('Error', error.body ? error.body.message : error.message, 'error');
            });
    }

    handleCheckboxChange(event) {
        const itemId = event.target.dataset.id;
        const item = this.checklistItems.find(item => item.Id === itemId);
        item.Complete__c = event.target.checked;
        item.Complete_Date__c = new Date().toISOString();
        console.log('Checkbox Change Item:', item);

        updateChecklistItem({ checklistItem: item })
            .then(() => {
                this.showToast('Success', 'Checklist item updated successfully', 'success');
                return refreshApex(this.wiredChecklistItemsResult);
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
                console.error('Error updating checklist item:', error);
            });
    }

    handleNameChange(event) {
        const itemId = event.target.dataset.id;
        const item = this.checklistItems.find(item => item.Id === itemId);
        item.Name = event.target.value;
        console.log('Name Change Item:', item);

        updateChecklistItem({ checklistItem: item })
            .then(() => {
                this.showToast('Success', 'Checklist item updated successfully', 'success');
                return refreshApex(this.wiredChecklistItemsResult);
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
                console.error('Error updating checklist item:', error);
            });
    }

    openModal() {
        this.isModalOpen = true;
    }

    closeModal() {
        this.isModalOpen = false;
        this.newItemName = '';
    }

    handleNameInputChange(event) {
        this.newItemName = event.target.value;
    }

    handleSaveNewItem() {
        createChecklistItem({ itemName: this.newItemName, eventId: this.eventId })
            .then(() => {
                this.showToast('Success', 'New checklist item created successfully', 'success');
                this.closeModal();
                return refreshApex(this.wiredChecklistItemsResult);
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
                console.error('Error creating checklist item:', error);
            });
    }

    handleDelete(row) {
        const itemId = row.Id;
        if (confirm('Are you sure you want to delete this item?')) {
            deleteChecklistItem({ eventId: this.eventId, itemId: itemId })
                .then(() => {
                    this.showToast('Success', 'Checklist item deleted successfully', 'success');
                    return refreshApex(this.wiredChecklistItemsResult);
                })
                .catch(error => {
                    this.showToast('Error', error.body.message, 'error');
                    console.error('Error deleting checklist item:', error);
                });
        }
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'delete') {
            this.handleDelete(row);
        }
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(event);
    }

    get isContributor() {
        return this.userRole === 'Contributor';
    }

    get isOrganiser() {
        return this.userRole === 'Organiser';
    }

    get columns() {
        const baseColumns = [
            { label: 'Name', fieldName: 'Name', type: 'text', editable: this.isOrganiser },
            { label: 'Complete', fieldName: 'Complete__c', type: 'boolean', typeAttributes: { iconName: 'utility:check' }, editable: true }
        ];

        if (this.isContributor) {
            baseColumns.push({
                type: 'button-icon',
                typeAttributes: {
                    iconName: 'utility:check',
                    name: 'complete',
                    title: 'Complete',
                    variant: 'border-filled',
                    alternativeText: 'Complete'
                }
            });
        }

        if (this.isOrganiser) {
            baseColumns.push({
                type: 'button-icon',
                typeAttributes: {
                    iconName: 'utility:delete',
                    name: 'delete',
                    title: 'Delete',
                    variant: 'border-filled',
                    alternativeText: 'Delete'
                }
            });
        }

        return baseColumns;
    }

    get filterOptions() {
        return [
            { label: 'All', value: 'all' },
            { label: 'Complete', value: 'complete' },
            { label: 'Incomplete', value: 'incomplete' }
        ];
    }
}