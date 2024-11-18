/**
 * @description       : 
 * @author            : Musa Nkuna | 216066715
 * @group             : ISJ
**/
public without sharing class EventController {

    @AuraEnabled(cacheable=true)
    public static List<EBEvent__c> getEvents() {
        return new EventsSelector().getEventsByRole('organiser');
    }

    @AuraEnabled(cacheable=true)
    public static List<EBEvent__c> getContributorEvents() {
        return  new EventsSelector().getEventsByRole('contributor');
    }

    @AuraEnabled
    public static void updateEvents(List<EBEvent__c> data) {
        try {
            update data;
        } catch (DmlException e) {
            if(e.getMessage().contains('REQUIRED_FIELD_MISSING') || e.getMessage().contains('Name field is required')){
                throw new AuraHandledException('Error updating events: Make sure Event Name, Date and Location are filled');
            }
            throw new AuraHandledException('Error updating events: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void createEvent(EBEvent__c event) {
        try {
            insert event;
            // Ensure the event is inserted before creating the User_Event__c record
            User_Event__c userEvent = new User_Event__c(
                EBEvent__c = event.Id,
                User__c = UserInfo.getUserId(),
                Role__c = 'Organiser'
            );
            insert userEvent;
            
            EBAccount__c acc = new EBAccount__c(
            	EBEventId__c = event.Id
            );
            insert acc;
            new ChecklistController().createNewChecklist(event.Id);
        } catch (DmlException e) {
            throw new AuraHandledException('Error creating event: ' + e.getMessage());
        }
    }

    @AuraEnabled
    public static void deleteEvent(Id eventId) {
        try {
            delete [SELECT Id FROM EBEvent__c WHERE Id = :eventId];
        } catch (DmlException e) {
            throw new AuraHandledException('Error deleting event: ' + e.getMessage());
        }
    }
}