

module TSOS{

export class Memory{
    public mem = [];
    constructor(){
        this.mem=this.mem;
    }

    public init(){
        for(let i = 0;i<767;i++){
            this.mem.push(0x00);
        }
    }



}


}