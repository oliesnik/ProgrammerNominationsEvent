public with sharing class CandidateNominationTrH implements ITriggerHandler{
public void beforeInsert(List<SObject> newRecord) {
        List<CandidateNomination__c> newRecords = (List<CandidateNomination__c>)newRecord;
// Check for uploading through Datalouder
        List<String> detailsToCheckDuplicates = new List<String>();
        for (CandidateNomination__c newCandNomination : newRecords) {
            String recordDetails = newCandNomination.NominationId__c + ' ' + newCandNomination.Nominees__c;
            if (detailsToCheckDuplicates.contains(recordDetails)){
                newCandNomination.addError('This Candidate Nomination already exists');
            } else {
                detailsToCheckDuplicates.add(recordDetails);
            } 
        }
// Master/child check
        List<CandidateNomination__c> masterCandidates = [SELECT ID, NominationId__c, Nominees__c, Description__c
                                                        FROM CandidateNomination__c WHERE Type__c = 'Master'];
        for (CandidateNomination__c candidate : newRecords) {
            //candidate.Type__c='Master';
                for (CandidateNomination__c  masterCandidate : masterCandidates) {
                    if (candidate.NominationId__c != masterCandidate.NominationId__c 
                            && candidate.Nominees__c != masterCandidate.Nominees__c
                            && candidate.Description__c != masterCandidate.Description__c) {
                                candidate.Type__c='Master';
                    } else if (candidate.NominationId__c == masterCandidate.NominationId__c 
                         && candidate.Nominees__c == masterCandidate.Nominees__c) {
                            candidate.Type__c = 'Child';
                            candidate.MasterRecordId__c = masterCandidate.Id;
                    } else {
                        candidate.addError('This Candidate Nomination already exists');
                    }
                }
        }
            // for (CandidateNomination__c  masterCandidate : masterCandidates) {
            //     if(candidate.NominationId__c == masterCandidate.NominationId__c 
            //         && candidate.Nominees__c == masterCandidate.Nominees__c
            //         && candidate.Description__c == masterCandidate.Description__c ){
            //             candidate.addError('This Candidate Nomination already exists');     
            //     } else if (candidate.NominationId__c == masterCandidate.NominationId__c 
            //     && candidate.Nominees__c == masterCandidate.Nominees__c) {
            //         candidate.Type__c = 'Child';
            //         candidate.MasterRecordId__c = masterCandidate.Id;
            //     }
            
        
// Check child records for duplicates
        Set<Id> masterRecordIds = new Set<Id>();
        for (CandidateNomination__c candidate : newRecords) {
            if (candidate.MasterRecordId__c != null) {
                masterRecordIds.add(candidate.MasterRecordId__c);
            }
        }
        List<CandidateNomination__c> childCandidates = [SELECT ID, NominationId__c, Nominees__c, Description__c, MasterRecordId__c
                                                            FROM CandidateNomination__c WHERE MasterRecordId__c IN : masterRecordIds];

        for (CandidateNomination__c candidate : newRecords) {
            for (CandidateNomination__c  childCandidate : childCandidates) {
                if (candidate.Description__c == childCandidate.Description__c && 
                    candidate.MasterRecordId__c == childCandidate.MasterRecordId__c) {
                    candidate.addError('This Candidate Nomination already exists');
                }
            }
        }
    }
    public void beforeDelete(Map<Id, SObject> delRecord) {
        Set<String> ids = new Set<String>();
        for(CandidateNomination__c candidate : (List<CandidateNomination__c>)delRecord.values()){
            ids.add(candidate.id);
        }
        List<CandidateNomination__c> masterCandidates =  [SELECT ID, 
                                                (SELECT ID, NominationId__c, Nominees__c, Description__c FROM ChildCandidateNominations__r)
                                                FROM CandidateNomination__c where ID IN :ids AND Type__c = 'Master'];
        List<CandidateNomination__c> toUpdate = new List<CandidateNomination__c>();
        for (CandidateNomination__c masterCandidate :masterCandidates) {
            List<CandidateNomination__c> childCandidates = masterCandidate.ChildCandidateNominations__r;
            if(!childCandidates.isEmpty()){
                childCandidates[0].Type__c = 'Master';
                childCandidates[0].MasterRecordID__c = NULL;
                for(Integer i = 1; i < childCandidates.size(); i++){
                    childCandidates[i].MasterRecordID__c = childCandidates[0].ID;
                }
                toUpdate.addAll(childCandidates);
            } 
        }
        update toUpdate;
    }
    public void beforeUpdate(Map<Id, SObject> newItems, Map<Id, SObject> oldItems){}
    public void afterInsert(Map<Id, SObject> newItems){}
    public void afterUpdate(Map<Id, SObject> newItems, Map<Id, SObject> oldItems){}
    public void afterDelete(Map<Id, SObject> oldItems){}
    public void afterUndelete(Map<Id, SObject> oldItems){}
}