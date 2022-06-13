import DisputeJournals from '../db/model/disputejournals.model';

class DisputeJournal {

    // validate details
    public async logDispute(data) {
        const disputejournal = new DisputeJournals(data);
        await disputejournal.save();
        return disputejournal;
    }

    public updateDispute(data, ) {



    }

    public deleteDispute() {

    }

    // by date
    // by transaction type
    public getDisputes() {

    }

}

export default new DisputeJournal();