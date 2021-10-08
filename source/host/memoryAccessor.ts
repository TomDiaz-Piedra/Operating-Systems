module TSOS{

    export class MemoryAccessor{
        private lob:number;
        private hob:number;

        private _MAR:number;
        private _MDR:number;
        constructor(){

        }
        //Getters & Setters for MDR
        getMDR(){
            return this._MDR;
        }

        setMDR(newMDR:number){
            this._MDR=newMDR;
        }

        //Getters & Setters for MAR
        getMAR(){
            return this._MAR;
        }

        setMAR(newMAR:number){
            this._MAR=newMAR;
        }
        public setLOB(lob:number){
            this.lob=lob;
        }
        public setHOB(hob:number){
            this.hob=hob;
        }
        public getLOB(){
            return this.lob;
        }
        public getHOB(){
            return this.hob;
        }

        read(){
            //Sets a temp variable equal to the current MAR
            let temp:number = this.getMAR();
            //Sets the current MDR equal to the Memory at the location in the MAR
            this.setMDR(_Memory.mem[temp]);
        }

//Writes the MDR into the memory position designated by the MAR
        write(){
            let tempMAR=this.getMAR();
            let tempMDR=this.getMDR();
            _Memory.mem[tempMAR]=tempMDR;
        }

        //Clears the newly Available Memory Segment, and then calls the MMU to update its status
        public clearSegment(segment:any){
            let memSeg = _MemoryManager.memSegments[segment].Start;
            //Clears the memory segment by rewriting each slot to 0x00, then updates memory display for GUI.
            for(let i = memSeg;i<memSeg+SEGMENT_LENGTH;i++){
                this.setMAR(i);
                this.setMDR(0x00);
                this.write();
                TSOS.Control.UpdateMemDisplay();

            }
            //Once the old program has been wiped, the Memory Manager can make the Segment Available Again!
            _MemoryManager.UpdateValid(segment);

        }




    }


}