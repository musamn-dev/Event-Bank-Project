import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import searchUser from '@salesforce/apex/UserController.searchUser';
import addUser from '@salesforce/apex/UserController.addUser';

export default class UserManager extends LightningElement {
    @track searchKey = '';
    @track user = {};
    @track userFound = false;
    @track showTryAgain = false;
    @track showConfirmation = false;

    handleInputChange(event) {
        this.searchKey = event.target.value;
    }

    handleSearch() {
        searchUser({ searchKey: this.searchKey })
            .then(result => {
                if (result) {
                    this.user = result;
                    this.userFound = true;
                    this.showTryAgain = false;
                    this.showToast('Success', 'User found!', 'success');
                } else {
                    this.userFound = false;
                    this.showTryAgain = true;
                    this.showToast('Error', 'User not found. Try again.', 'error');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                this.userFound = false;
                this.showTryAgain = true;
                this.showToast('Error', 'An error occurred. Try again.', 'error');
            });
    }

    handleAddUser() {
        this.showConfirmation = true;
    }

    confirmAddUser() {
        addUser({ userId: this.user.Id, role: 'contributor' })
            .then(() => {
                this.showConfirmation = false;
                this.showToast('Success', 'User added successfully!', 'success');
            })
            .catch(error => {
                console.error('Error:', error);
                this.showToast('Error', 'Failed to add user. Try again.', 'error');
            });
    }

    cancelAddUser() {
        this.showConfirmation = false;
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
}