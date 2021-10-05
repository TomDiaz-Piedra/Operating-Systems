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
        }
    }
    TSOS.processControlBlock = processControlBlock;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=processControlBlock.js.map