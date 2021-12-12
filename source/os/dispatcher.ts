module TSOS{
    export class Dispatcher{

        //Use this to grab the next program to load onto CPU(dequeue of readyqueue)
        //Then use a method to check whether its location is Memory or Disk
        //If Memory, continue as Normal. If Disk, we need to roll out and roll in
        private nextProg;

        public contextSwitch() {
            this.saveState();
            this.loadNew(this.nextProg);
        }
        public checkLocation(prog){
            this.nextProg=prog;
            if(this.nextProg.location=="Disk"){
                return true;
            }
            else if(this.nextProg.location=="Memory"){
                return false;
                //We Continue the context switch as we do not have to use the swapper
            }
        }
        //Update the current PCB with the current CPU values
        //Reset the Programs quantum to zero
        //Put it back onto the readyqueue
        //Depending on next process, might move to disk
        //Make a checkLoc method to check where the next process is: if in mem,we just run loadNew with the nextProg, if in disk do roll in roll out and then do loadNew
        public saveState(){
            var onDisk;
            _CPU.isExecuting=false;//stop cpu while we switch
           if(readyqueue.isEmpty()){
                //Nothing
            }
           else{
               onDisk = this.checkLocation(readyqueue.dequeue()); //Check where the next program is located, if its in Disk we Roll IN/OUT

           }

            if(_CPU.currentProgram.state=='terminated'){

            }
            else{
                _Kernel.krnTrace('Saving Process State');
                _CPU.currentProgram.state='ready';
                if(onDisk){
                    //Roll out current program
                    _Swapper.rollOut();
                    let test = _CPU.currentProgram;
                    //_StdOut.putText("Rolled Out Program: "+test.segment);
                    //Roll in nextProg
                    _Swapper.rollIn(this.nextProg);
                    //_StdOut.putText("Rolled In Program: "+this.nextProg);

                }


                //Check in here if next program is in Disk or Memory:
                //If Disk Roll Out this program(still enqueue it onto readyqueue)
                //And Roll In the next program into Memory and then loadNew
                //Change loadNew to take a PCB parameter and have that be the next program to load
                //Just dequeue, check where it is, if in mem we run loadNew right away, if on disk we roll in/out and then run loadNew
                let oldProg = _CPU.currentProgram;
                oldProg.quanta=0;
                _CPU.currentProgram.quanta=0;
                _CPU.updateCurrent();
                TSOS.Control.updatePCB(_CPU.currentProgram);

                //Roll it out right before re queueing it, clear segment and move it onto disk
                readyqueue.enqueue(_CPU.currentProgram);
            }


        }
        //Set all CPU values to the new Program's values. Start running the new program
        public loadNew(newProg){
            _CPU.currentProgram=newProg;
            _CPU.currentProgram.init();
            _CPU.PC=_CPU.currentProgram.pc;
            _CPU.Acc=_CPU.currentProgram.acc;
            _CPU.xReg=_CPU.currentProgram.xReg;
            _CPU.yReg=_CPU.currentProgram.yReg;
            _CPU.zFlag=_CPU.currentProgram.zReg;
            _CPU.IR=_CPU.currentProgram.IR;
            _CPU.step=1;
            _CPU.currentProgram.state="running";
            TSOS.Control.updatePCB(_CPU.currentProgram);
            _CPU.isExecuting=true;
        }
    }

}