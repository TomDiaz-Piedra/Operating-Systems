var TSOS;
(function (TSOS) {
    class Dispatcher {
        contextSwitch() {
            _Kernel.krnTrace('Context Switch');
            this.saveState();
            this.loadNew();
        }
        //Update the current PCB with the current CPU values
        //Reset the Programs quantum to zero
        //Put it back onto the readyqueue
        saveState() {
            if (_CPU.currentProgram.state == 'terminated') {
            }
            else {
                _Kernel.krnTrace('Saving Process State');
                _CPU.currentProgram.state = 'ready';
                TSOS.Control.updatePCB(_CPU.currentProgram);
                _CPU.updateCurrent();
                let oldProg = _CPU.currentProgram;
                oldProg.quanta = 0;
                readyqueue.enqueue(oldProg);
            }
        }
        //Set all CPU values to the new Program's values. Start running the new program
        loadNew() {
            let newProg = readyqueue.dequeue();
            _CPU.currentProgram = newProg;
            _CPU.PC = _CPU.currentProgram.pc;
            _CPU.Acc = _CPU.currentProgram.acc;
            _CPU.xReg = _CPU.currentProgram.xReg;
            _CPU.yReg = _CPU.currentProgram.yReg;
            _CPU.zFlag = _CPU.currentProgram.zReg;
            _CPU.IR = _CPU.currentProgram.IR;
            _CPU.step = 1;
            _CPU.currentProgram.state = "running";
            TSOS.Control.updatePCB(_CPU.currentProgram);
            _CPU.isExecuting = true;
        }
    }
    TSOS.Dispatcher = Dispatcher;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=dispatcher.js.map