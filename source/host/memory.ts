

module TSOS{

export class Memory{

    constructor(public mem = new Array(256)){
        this.mem=mem;
    }

    public init(){
        for(let i = 0;i<255;i++){
            this.mem.push(0x00);
        }
    }



}


}