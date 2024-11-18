/**
 * @description       : This class uses the FFLib Library to create a Selector class for the User-Event junction object.
 * @author            : Musa Nkuna | 216066715
 * @group             : ISJ
**/

public with sharing class UserController {

    @AuraEnabled(cacheable=true)
    public static User searchUser(String searchKey) {

        List<User> users = [SELECT Id, Name, Username 
                            FROM User 
                            WHERE Username = :searchKey 
                            LIMIT 1];

        if(UserInfo.getUserId() == users[0].Id) {
            throw new AuraHandledException('Search failed. You are already part of the event');
        }

        if (users.isEmpty()) {
            throw new AuraHandledException('User not found Try again!');
        }
        return users[0];
    }

    @AuraEnabled
    public static void addUser(Id userId, Id eventId) {
        User_Event__c userEvent = new User_Event__c(
                EBEvent__c = eventId,
                User__c = userId,
                Role__c = 'Contributor'
            );
            insert userEvent;
    }

/***********************userEventManager code follows*********************************/

    @AuraEnabled(cacheable=true)
    public static List<Map<String, Object>> getUsersByEventId() {
        Id eventId = getEventIdForCurrentUser();
        List<User_Event__c> userEvents = [
            SELECT Id, EBEvent__c, Role__c, User__c, User__r.Name, User__r.Username
            FROM User_Event__c
            WHERE EBEvent__c = :eventId
        ];

        List<Map<String, Object>> result = new List<Map<String, Object>>();
        for (User_Event__c ue : userEvents) {
            Map<String, Object> userMap = new Map<String, Object>();
            userMap.put('Id', ue.Id);
            userMap.put('EBEvent__c', ue.EBEvent__c);
            userMap.put('Role__c', ue.Role__c);
            userMap.put('User__c', ue.User__c);
            userMap.put('Name', ue.User__r.Name);
            userMap.put('Username', ue.User__r.Username);
            userMap.put('UserId', ue.User__r.Id);
            result.add(userMap);
        }
        return result;
    }

    @AuraEnabled(cacheable=true)
    public static String getCurrentUserRole() {
        Id eventId = getEventIdForCurrentUser();
        User_Event__c userEvent = [
            SELECT Role__c
            FROM User_Event__c
            WHERE User__c = :UserInfo.getUserId() AND EBEvent__c = :eventId
            LIMIT 1
        ];
        return userEvent != null ? userEvent.Role__c : null;
    }

    @AuraEnabled
    public static void deleteUserEvent(Id userEventId) {
        User_Event__c userEvent = [SELECT Id, User__c FROM User_Event__c WHERE Id = :userEventId];
        if (userEvent.User__c == UserInfo.getUserId()) {
            throw new AuraHandledException('Action Not Allowed');
        }
        delete userEvent;
    }

    @AuraEnabled
    public static void updateUserRole(Id userEventId, String newRole) {
        User_Event__c userEvent = [SELECT Id, User__c, Role__c FROM User_Event__c WHERE Id = :userEventId];
        if (userEvent.User__c == UserInfo.getUserId()) {
            throw new AuraHandledException('Action Not Allowed');
        }
        userEvent.Role__c = newRole;
        update userEvent;
    }

    private static Id getEventIdForCurrentUser() {
        GlobalVariable__c globalVar = [
            SELECT EventId__c
            FROM GlobalVariable__c
            WHERE Name = 'EventId' AND UserId__c = :UserInfo.getUserId()
            LIMIT 1
        ];
        return globalVar != null ? globalVar.EventId__c : null;
    }
}