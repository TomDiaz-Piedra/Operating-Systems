var TSOS;
(function (TSOS) {
    class Scheduler {
        constructor(quantum = Quantum) {
            this.quantum = quantum;
        }
        programEnd() {
            //On program end we clear the segment, set its state to terminated,and update the pcb display
            _CPU.currentProgram.state = "terminated";
            TSOS.Control.updatePCB(_CPU.currentProgram);
            _MemoryAccessor.clearSegment(_CPU.currentProgram.segment.Number);
            //if the current program is terminated we want to either swap to the next one, or stop the cpu if there are none left
            // if(_CPU.currentProgram.state=='terminated'){
            //If there are no programs left we stop the cpu
            if (readyqueue.isEmpty()) {
                _CPU.isExecuting = false;
            }
            //If there are more programs in the readyqueue we will perform a context switch
            else {
                _Dispatcher.contextSwitch();
            }
            // }
        }
        roundRobin() {
            //If the process is still running, but its quantum has run out we perform a context switch
            if (_CPU.currentProgram.quanta >= this.quantum) {
                _Dispatcher.contextSwitch();
            }
        }
    }
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=scheduler.js.map