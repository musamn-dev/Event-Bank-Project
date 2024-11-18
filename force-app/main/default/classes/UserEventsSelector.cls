/**
 * @description       : This class uses the FFLib Library to create a Selector class for the User-Event junction object.
 * @author            : Musa Nkuna | 216066715
 * @group             : ISJ
**/

public without sharing class UserEventsSelector extends fflib_SObjectSelector{

    public UserEventsSelector(){
        super.setDataAccess(DataAccess.SYSTEM_MODE);
    }
    
    public Schema.SObjectType getSObjectType() {
        return User_Event__c.sObjectType;
    }

    public List<Schema.SObjectField> getSObjectFieldList() {
        return new List<Schema.SObjectField>{
            User_Event__c.Id,
            User_Event__c.Role__c
        };
    }

    public List<User_Event__c> getEventsByRole(String role) {

        System.debug('qry :: ' +  newQueryFactory(false)
        .selectField('User__r.Id')
        .selectField('EBEvent__r.Name')
        .selectField('EBEvent__r.Date__c')
        .selectField('EBEvent__r.Location__c')
        .selectField('EBEvent__r.Description__c')
        .setCondition('Role__c = \''+ role +'\' AND User__r.Username = \''+ UserInfo.getUsername() +'\'')
        .toSOQL());
//.setCondition('Role__c = :role AND User__r.Username = \''+ UserInfo.getUsername() +'\'')
        return Database.query(
            newQueryFactory(false)
            .selectField('User__r.Id')
            .selectField('EBEvent__r.Name')
            .selectField('EBEvent__r.Date__c')
            .selectField('EBEvent__r.Location__c')
            .selectField('EBEvent__r.Description__c')
            .setCondition('Role__c = :role AND User__r.Username = \''+ UserInfo.getUsername() +'\'')
            .toSOQL()
        );
    }
}