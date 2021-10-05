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
            this.setMDR(_Memory[temp]);
        }

//Writes the MDR into the memory position designated by the MAR
        write(){
            let tempMAR=this.getMAR();
            let tempMDR=this.getMDR();
            _Memory[tempMAR]=tempMDR;
        }




    }


}