var TSOS;
(function (TSOS) {
    class processControlBlock {
        //public segmentNum;
        //public base;
        //public limit;
        //public offset;
        constructor() {
            this.pc = 0;
            this.pcInc = 0;
            this.IR = 0;
            this.acc = 0;
            this.xReg = 0;
            this.yReg = 0;
            this.zReg = 0;
            this.state = "resident";
            this.priority = 0;
            this.pid = _NextAvailablePID;
            this.segment = this.segment;
            //this.base=this.segment.Start;
            //this.limit=this.segment.End;
            //this.offset=this.segment.offset;
            //this.segmentNum=this.segment.Number;
        }
        getPCB(pid) {
            let ans;
            for (let i = 0; i < residentlist.length; i++) {
                let pcb = residentlist[i];
                if (pcb.pid == pid) {
                    ans = pcb;
                }
                //residentqueue.enqueue(pcb);
            }
            return ans;
        }
    }
    TSOS.processControlBlock = processControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map