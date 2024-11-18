/**
 * @description       : This class is used to control global variables where needed
 * @author            : Musa Nkuna | 216066715
 * @group             : ISJ
**/
public with sharing class GlobalVariableController {
    @AuraEnabled(cacheable=true)
    public static void upsertEvent(String eventId) {
        try {
            String organiserId = UserInfo.getUserId();
            upsertEventAsync(organiserId, eventId);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @future
    public static void upsertEventAsync(String organiserId, String eventId) {
        try {
            List<GlobalVariable__c> eventList = [SELECT Id, EventId__c FROM GlobalVariable__c WHERE UserId__c = :organiserId AND Name = 'EventId' LIMIT 1];

            GlobalVariable__c variable;
            if (!eventList.isEmpty()) {
                variable = eventList[0];
                variable.EventId__c = eventId;
            } else {
                variable = new GlobalVariable__c(
                    Name = 'EventId',
                    EventId__c = eventId,
                    UserId__c = organiserId
                );
            }

            upsert variable;
        } catch (Exception e) {
            System.debug('Error in upsertEventAsync: ' + e.getMessage());
        }
    }

     /**
    * Retrieves the event ID for the current user.
    *
    * @return The event ID.
    **/
    @AuraEnabled(cacheable=true)
    public static Id getEventId() {
        // Query the GlobalVariable__c object to get the event ID for the current user
        List<GlobalVariable__c> eventList = [SELECT EventId__c FROM GlobalVariable__c WHERE UserId__c = :UserInfo.getUserId() AND Name = 'EventId' LIMIT 1];
        
        // Check if the event list is not empty and return the event ID
        if (!eventList.isEmpty()) {
            return eventList[0].EventId__c;
        }
        
        // Return null if no event ID is found
        return null;
    }
}