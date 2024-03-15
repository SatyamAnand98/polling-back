export class SocketCount {
    private static currentAvailableVoters: number = 0;
    private static voters: Record<string, string> = {};

    static setVoterCount() {
        this.currentAvailableVoters++;
    }

    // static getVoterCount() {
    //     return this.currentAvailableVoters;
    // }

    static decreaseVoterCount() {
        this.currentAvailableVoters--;
    }

    static addVoter(socketId: string, name: string) {
        if (socketId && name) {
            this.voters[socketId] = name;
        } else {
            throw new Error("SocketId and name are required.");
        }
    }

    static removeVoter(socketId: string) {
        if (socketId) {
            delete this.voters[socketId];
        } else {
            throw new Error("SocketId is required.");
        }
    }

    static getVoterCount() {
        return Object.keys(this.voters).length;
    }
}
