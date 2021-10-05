var TSOS;
(function (TSOS) {
    class MemoryAccessor {
        constructor() {
        }
        //Getters & Setters for MDR
        getMDR() {
            return this._MDR;
        }
        setMDR(newMDR) {
            this._MDR = newMDR;
        }
        //Getters & Setters for MAR
        getMAR() {
            return this._MAR;
        }
        setMAR(newMAR) {
            this._MAR = newMAR;
        }
        setLOB(lob) {
            this.lob = lob;
        }
        setHOB(hob) {
            this.hob = hob;
        }
        getLOB() {
            return this.lob;
        }
        getHOB() {
            return this.hob;
        }
        read() {
            //Sets a temp variable equal to the current MAR
            let temp = this.getMAR();
            //Sets the current MDR equal to the Memory at the location in the MAR
            this.setMDR(_Memory[temp]);
        }
        //Writes the MDR into the memory position designated by the MAR
        write() {
            let tempMAR = this.getMAR();
            let tempMDR = this.getMDR();
            _Memory[tempMAR] = tempMDR;
        }
    }
    TSOS.MemoryAccessor = MemoryAccessor;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=memoryAccessor.js.map