

module TSOS{
    export class Scheduler{

        constructor(

                    ) {
        }
        public programEnd(program, ifReady:Boolean){
            _Kernel.krnTrace('Terminating Process');

            //On program end we clear the segment, set its state to terminated,and update the pcb display
            program.state="terminated";
            program.location="Moon";
            TSOS.Control.updatePCB(program);
            _MemoryAccessor.clearSegment(program.segment.Number);
            _StdOut.putText(" Process PID: "+program.pid+" Turnaround: "+program.turnaround+" Wait: "+program.wait);
            //if the current program is terminated we want to either swap to the next one, or stop the cpu if there are none left
            // if(_CPU.currentProgram.state=='terminated'){
            //If there are no programs left we stop the cpu
            if(ifReady){

            }
            else {
                if (readyqueue.isEmpty()) {
                    _CPU.isExecuting = false;
                }
                //If there are more programs in the readyqueue we will perform a context switch
                else {
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH, [0]));
                    //_Dispatcher.contextSwitch();

                }
            }
           // }

        }
        //Add methods for FCFS and Priority and then make a method with a switch case for each of these, and replace the roundRobin in CPU with the switch case method
        public roundRobin(){

            //If the process is still running, but its quantum has run out we perform a context switch
            if(_CPU.currentProgram.quanta>=Quantum && !readyqueue.isEmpty()){
                //_Dispatcher.contextSwitch();
                //_CPU.isExecuting=false;
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH, [0]));
                return true;

            }
            return false;
        }
        public fcfs(){
            Quantum=Number.MAX_SAFE_INTEGER;
        }
        //maybe implement
        public priority(){

        }
        public schedulingAlg(){
            if(currentSchedule=="rr"){
                this.roundRobin();
                return true;
            }
            else if(currentSchedule=="fcfs"){
                //We do Nothing
                return false;
            }
            else if(currentSchedule=="priority"){
                //IDK
                return false;
            }

        }

    }

}