import { LightningElement, api } from 'lwc';

export default class ErrorPanel extends LightningElement {
    @api errors;

    get errorMessages() {
        return (this.errors || []).map(error => error.message);
    }
}