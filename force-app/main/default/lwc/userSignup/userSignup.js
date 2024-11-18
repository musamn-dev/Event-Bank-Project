import { LightningElement, track } from 'lwc';
import createUser from '@salesforce/apex/UserSignupController.createUser';

export default class UserSignup extends LightningElement {
    @track firstName = '';
    @track lastName = '';
    @track nickname = '';
    @track email = '';
    @track password = '';
    @track confirmPassword = '';

    handleInputChange(event) {
        const field = event.target.dataset.id;
        this[field] = event.target.value;
    }

    handleSignup() {
        if (this.password !== this.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        createUser({
            firstName: this.firstName,
            lastName: this.lastName,
            nickname: this.nickname,
            email: this.email,
            password: this.password
        })
        .then(result => {
            alert('User registered successfully');
        })
        .catch(error => {
            alert('Error creating user: ' + error.body.message);
        });
    }
}