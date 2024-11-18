import { LightningElement, wire, track, api } from 'lwc';
import getUsersByEventId from '@salesforce/apex/UserController.getUsersByEventId';
import getCurrentUserRole from '@salesforce/apex/UserController.getCurrentUserRole';
import deleteUserEvent from '@salesforce/apex/UserController.deleteUserEvent';
import updateUserRole from '@salesforce/apex/UserController.updateUserRole';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import USER_ID from '@salesforce/user/Id';

export default class UserEventComponent extends LightningElement {
    @track users = [];
    @track error;
    @track currentUserRole;
    @track currentUserId = USER_ID;
    @track isModalOpen = false;
    @track selectedUser = {};
    @track newRole = '';
    @api action; // Action variable from Flow

    wiredUsersResult;

    @wire(getUsersByEventId)
    wiredUsers(result) {
        this.wiredUsersResult = result;
        const { error, data } = result;
        if (data) {
            if (this.action === 'manageOrganiser') {
                this.users = data.filter(user => user.Role__c.toLowerCase() === 'organiser');
            } else if (this.action === 'manageContributor') {
                this.users = data.filter(user => user.Role__c.toLowerCase() === 'contributor');
            }
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.users = [];
        }
    }

    @wire(getCurrentUserRole)
    wiredUserRole({ error, data }) {
        if (data) {
            this.currentUserRole = data;
        } else if (error) {
            this.error = error;
        }
    }

    get columns() {
        const baseColumns = [
            { label: 'Name', fieldName: 'Name', type: 'text' },
            { label: 'Username', fieldName: 'Username', type: 'text' },
            { label: 'Role', fieldName: 'Role__c', type: 'text' }
        ];

        if (this.action === 'manageOrganiser') {
            baseColumns.push({
                type: 'button-icon',
                typeAttributes: {
                    iconName: 'utility:down',
                    name: 'demote',
                    title: 'Demote',
                    variant: 'border-filled',
                    alternativeText: 'Demote'
                }
            });
        } else if (this.action === 'manageContributor') {
            baseColumns.push(
                {
                    type: 'button-icon',
                    typeAttributes: {
                        iconName: 'utility:up',
                        name: 'promote',
                        title: 'Promote',
                        variant: 'border-filled',
                        alternativeText: 'Promote'
                    }
                },
                {
                    type: 'button-icon',
                    typeAttributes: {
                        iconName: 'utility:delete',
                        name: 'delete',
                        title: 'Delete',
                        variant: 'border-filled',
                        alternativeText: 'Delete'
                    }
                }
            );
        }

        return baseColumns;
    }

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'demote':
                this.handleDemote(row);
                break;
            case 'promote':
                this.handlePromote(row);
                break;
            case 'delete':
                this.handleDelete(row);
                break;
            default:
        }
    }

    handleDemote(row) {
        const userEventId = row.Id;
        updateUserRole({ userEventId, newRole: 'contributor' })
            .then(() => {
                this.showToast('Success', 'User demoted successfully', 'success');
                return refreshApex(this.wiredUsersResult);
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    handlePromote(row) {
        const userEventId = row.Id;
        updateUserRole({ userEventId, newRole: 'organiser' })
            .then(() => {
                this.showToast('Success', 'User promoted successfully', 'success');
                return refreshApex(this.wiredUsersResult);
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error');
            });
    }

    handleDelete(row) {
        const userEventId = row.Id;
        if (confirm('Are you sure you want to delete this user?')) {
            deleteUserEvent({ userEventId })
                .then(() => {
                    this.showToast('Success', 'User deleted successfully', 'success');
                    return refreshApex(this.wiredUsersResult);
                })
                .catch(error => {
                    this.showToast('Error', error.body.message, 'error');
                });
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
}