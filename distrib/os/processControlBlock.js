var TSOS;
(function (TSOS) {
    class processControlBlock {
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
        }
        getPCB(pid) {
            let ans;
            for (let i = 0; i < readyqueue.length; i++) {
                if (readyqueue[i].pid == pid) {
                    ans = readyqueue[i];
                }
            }
            return ans;
        }
    }
    TSOS.processControlBlock = processControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map