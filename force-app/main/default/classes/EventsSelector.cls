/**
 * @description       : This class uses the FFLib Library to create a Selector class for the Event object. 
 * @author            : Musa Nkuna | 216066715
 * @group             : ISJ
**/

public class EventsSelector extends fflib_SObjectSelector{

    public EventsSelector(){
        super.setDataAccess(DataAccess.SYSTEM_MODE);
    }

    public Schema.SObjectType getSObjectType() {
        return EBEvent__c.sObjectType;
    }

    public List<Schema.SObjectField> getSObjectFieldList() {
        return new List<Schema.SObjectField>{
            EBEvent__c.Id,
            EBEvent__c.Name,
            EBEvent__c.Date__c,
            EBEvent__c.Location__c,
            EBEvent__c.Description__c
        };
    }

    public List<EBEvent__c> getEventsByRole(String role) {

        return [SELECT Id, Name, Description__c, Location__c, Date__c
                FROM EBEvent__c
                WHERE Id IN (
                    SELECT EBEvent__c 
                    FROM User_Event__c 
                    WHERE Role__c = :role AND 
                          User__c = :UserInfo.getUserId()
                )];
    }
}