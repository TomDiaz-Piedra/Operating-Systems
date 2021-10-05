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


        }



    }


}