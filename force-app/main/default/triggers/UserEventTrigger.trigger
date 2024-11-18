/**
 * @description       : This trigger is used to ensure that a user is not added more than once in an event.
 * @author            : Musa Nkuna | 216066715
 * @group             : ISJ
**/
trigger UserEventTrigger on User_Event__c (before insert, before update) {
    Set<String> userEventSet = new Set<String>();
    for (User_Event__c record : Trigger.new) {
        String userEventCombination = record.EBEvent__c + '-' + record.User__c;
        userEventSet.add(userEventCombination);
    }

    // Check existing records in the database
    List<User_Event__c> existingRecords = [SELECT Id, EBEvent__c, User__c FROM User_Event__c WHERE EBEvent__c IN :userEventSet];
    for (User_Event__c existingRecord : existingRecords) {
        String existingUserEventCombination = existingRecord.EBEvent__c + '-' + existingRecord.User__c;
        for (User_Event__c record : Trigger.new) {
            String userEventCombination = record.EBEvent__c + '-' + record.User__c;
            if (userEventCombination == existingUserEventCombination) {
                System.debug('Duplicate found: ' + existingUserEventCombination);
                record.addError('User already exists in this event.');
            }
        }
    }
}