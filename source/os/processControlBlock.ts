module TSOS{

    export class processControlBlock{
        public pc: number;
        public pcInc;
        public IR:number;
        public acc:number;
        public xReg:number;
        public yReg:number;
        public zReg:number
        public state:string;
        public priority;
        public pid;
        public segment;
        public quanta;
        public turnaround;
        public wait;
        public base;
        public limit;
        public offset;
        public location;



        constructor(){
            this.pc=0;
            this.pcInc=0;
            this.IR=0;
            this.acc=0;
            this.xReg=0;
            this.yReg=0;
            this.zReg=0;
            this.state="resident";
            this.priority=0;
            this.pid=_NextAvailablePID;
            this.segment=this.segment;
            this.quanta=0;
            this.turnaround=0;
            this.wait=0;
            this.base;
            this.limit;
            this.offset;



        }
        public init() {
            if(this.segment==null){
                //If the pcb does not have a segment because it is going onto the disk, we just skip giving it its offset base and limit registers
                return;
            }
            this.segment=this.segment;
            this.base = this.segment.Start;
            this.limit = this.segment.End;
            this.offset=this.segment.offset;
        }

        getPCB(pid:number){
            let ans;
            for(let i=0;i<residentlist.length;i++){
                let pcb = residentlist[i];
                if(pcb.pid==pid){
                    ans = pcb;

                }

            }
            return ans;
        }



    }


}