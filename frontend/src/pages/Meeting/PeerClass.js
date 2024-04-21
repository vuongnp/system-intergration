export class PeerClass {
    constructor(options) {
        this.clientId = options?.clientId;
        this.peer = options?.peer;
        this.stream = null;
        this.username = options?.username;        
    };
}