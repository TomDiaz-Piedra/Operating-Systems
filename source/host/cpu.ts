/* ------------
     CPU.ts

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        public tempAdr: number;

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public step:number =1,
                    public IR: string,
                    public xReg: number = 0,
                    public currentProgram,
                    public yReg: number = 0,
                    public zFlag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.IR = this.IR;
            this.step=this.step;
            this.xReg = 0;
            this.yReg = 0;
            this.zFlag = 0;
            this.isExecuting = false;
        }


        public startCPU(){
            //this.currentProgram=null;

            let program = readyqueue.dequeue();
            this.currentProgram=program;
            //this.loadProgramState();
            this.PC=this.currentProgram.pc;
            this.step=1;
            this.currentProgram.state="running";
            TSOS.Control.updatePCB(this.currentProgram);
            this.isExecuting=true;
        }

        public programEnd(){
            _MemoryAccessor.clearSegment(this.currentProgram.segment.Number);
            this.currentProgram.state="terminated";
            TSOS.Control.updatePCB(this.currentProgram);
            let done = readyqueue.isEmpty();
            if(done){
                this.isExecuting = false;
            }
            else{
                this.isExecuting=false;
                _Scheduler.roundRobin();
            }
        }

        //Terminates current program in CPU
        public kill(){
            //this.programEnd();
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROGRAM_END, [this.currentProgram,false]));

        }
        public killAll(){
            this.kill();
            while(!readyqueue.isEmpty()){
                let killedProg = readyqueue.dequeue();
                this.currentProgram=killedProg;
                //this.programEnd();
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROGRAM_END, [this.currentProgram,false]));



            }
           // _MemoryAccessor.clearMem();
        }
        //Kills a non running process on the readyqueue
        public killNotRunning(pid:number){
            for(let i=0;i<readyqueue.getSize();i++){
                let temp = readyqueue.dequeue();
                if(temp.pid=pid){
                    //_Scheduler.programEnd(temp,true);
                    _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH, [this.currentProgram,true]));

                }
                else{
                    readyqueue.enqueue(temp);
                }

            }
        }






        //Checks if the Program is trying to access Memory outside of its segment
        public checkBoundsMem(adr){
            if(adr>this.currentProgram.segment.End || adr<this.currentProgram.segment.Start){
                _StdOut.putText("Error: Memory Boundary Infraction! Prepare for Neurotoxin!");
                _Scheduler.programEnd(this.currentProgram,false);
            }
        }


        public updateCurrent(){
            this.currentProgram.pc=this.PC;
            this.currentProgram.IR=this.IR;
            this.currentProgram.acc=this.Acc;
            this.currentProgram.xReg=this.xReg;
            this.currentProgram.yReg=this.yReg;
            this.currentProgram.zReg=this.zFlag;
        }

        //Getters and Setters for the X and Y registers
        public setXreg(xReg:number){
            this.xReg=xReg;
        }
        public setYreg(yReg:number){
            this.yReg=yReg;
        }
        public getXreg(){
            return this.xReg;
        }
        public getYreg(){
            return this.yReg;
        }
        public fetch(){
            //get op code from code at position program counter
            //this.op=this.mmu.mem.memory[this.pc];
            //check if the process is violating its memory boundaries

            _MemoryAccessor.setMAR(this.PC+this.currentProgram.segment.offset);
            _MemoryAccessor.read();
            this.IR=_MemoryAccessor.getMDR().toString(16).toUpperCase();
            if(this.IR=="AD" || this.IR=="8D" || this.IR=="6D" || this.IR=="AE" || this.IR=="AC" || this.IR=="EC" || this.IR=="EE" || this.IR=="A9" || this.IR =="A2"
            || this.IR =="A0" || this.IR =="D0" || this.IR =="AA" || this.IR =="A8" || this.IR=="8A" || this.IR =="98" || this.IR =="0" || this.IR=="FF" || this.IR=="EA"){

            }
            else{
                //if the OP code is not valid, we Set the IR to 00 and end the program
                this.IR="00";
                _Scheduler.programEnd(this.currentProgram, false);
            }
            if(this.IR=="0"){
                this.IR="00";
                this.step=7;
            }

            //increment program counter
            this.PC++;
            this.updateCurrent();
            this.step=2;

        }
        public decode1(){
            if(this.IR=="AD" || this.IR=="8D" || this.IR=="6D" || this.IR=="AE" || this.IR=="AC" || this.IR=="EC" || this.IR=="EE"){
                //this.mmu.setHOB(this.mmu.mem.memory[this.pc]);
                _MemoryAccessor.setMAR(this.PC+this.currentProgram.segment.offset);
                _MemoryAccessor.read();
                _MemoryAccessor.setHOB(_MemoryAccessor.getMDR());
                this.PC++;
                this.updateCurrent();

                this.step=3;
            }
            else{
                this.step=4;
            }

        }

        public decode2(){


            //this.mmu.setLOB(this.mmu.mem.memory[this.pc]);
            _MemoryAccessor.setMAR(this.PC+this.currentProgram.segment.offset);
            _MemoryAccessor.read();
            _MemoryAccessor.setLOB(_MemoryAccessor.getMDR());
            this.step=4;
        }

        public execute1(){


            //A9 - Load Accumulator with a Constant - 4 CPU Cycles
            if(this.IR=="A9"){
                //this.acc=this.mmu.mem.memory[this.pc];
                _MemoryAccessor.setMAR(this.PC+this.currentProgram.segment.offset);
                _MemoryAccessor.read();
                //let num = this.checkComp(_MemoryAccessor.getMDR());
                let num =_MemoryAccessor.getMDR();
                this.Acc =num;
                this.PC++;
                this.updateCurrent();
                this.step=1;
            }

            //A2 - Load X register with a constant - 4 CPU Cycles
            if(this.IR=="A2"){
                _MemoryAccessor.setMAR(this.PC+this.currentProgram.segment.offset);
                _MemoryAccessor.read();
                //let num = this.checkComp(_MemoryAccessor.getMDR());
                let num =_MemoryAccessor.getMDR();
                this.setXreg(num);
                //this.setXreg(this.mmu.mem.memory[this.pc]);
                this.PC++;
                this.updateCurrent();
                this.step=1;
            }

            //A0 - Load Y register with a constant - 4 CPU Cycles
            if(this.IR=="A0"){
                _MemoryAccessor.setMAR(this.PC+this.currentProgram.segment.offset);
                _MemoryAccessor.read();
                //let num = this.checkComp(_MemoryAccessor.getMDR());
                let num =_MemoryAccessor.getMDR();

                this.setYreg(num);
                //this.setYreg(this.mmu.mem.memory[this.pc]);
                this.PC++;
                this.updateCurrent();
                this.step=1;
            }

            //D0 - Branch N Bytes
            if(this.IR=="D0"){
                if(this.zFlag==1){
                    this.PC++;
                    this.updateCurrent();
                    this.step=1;
                }

                if(this.zFlag==0){
                    //this.PC++
                  //  this.checkBounds(this.PC+this.currentProgram.segment.offset);
                    _MemoryAccessor.setMAR(this.PC+this.currentProgram.segment.offset);
                    _MemoryAccessor.read();
                    const hex = _MemoryAccessor.getMDR();
                    let offset=this.checkComp(hex);
                    if(offset>0){
                        offset=offset+1;
                    }


                    this.PC =this.PC +offset;
                    if(this.PC>255){
                        this.PC = this.PC-256;
                    }
                  //  this.checkBounds(this.PC);
                    this.updateCurrent();
                    this.step=1;

                }

            }

            //AD - Load Accumulator from Memory - 5 Cycles
            if(this.IR=="AD"){
                let a=this.hexValue(_MemoryAccessor.getLOB(),2).concat(this.hexValue(_MemoryAccessor.getHOB(),2));
                let adr =parseInt(a, 16)-1;
                //If the memory boundaries are not violated, the current operation will run as normal
                //If the bounds are violated, the operation will not take place
                //Had to do it this way because without the IF statement, it would cancel the process properly if the bounds were violated, but still attempt to finish
                //the operation(ex. loading something from memory to the accumulator would set the accumulator to undefined as the memory in the segment has been wiped)
                //Even if it was not set up to reset the memory of a terminated process to all Ox00s it would instead end up violating the memory bounds anyways
                let valid:Boolean = _MemoryAccessor.checkBounds(adr);
                if(valid) {
                    _MemoryAccessor.setMAR(adr+ this.currentProgram.segment.offset);
                    _MemoryAccessor.read();
                    //let num = this.checkComp(_MemoryAccessor.getMDR());
                    let num = _MemoryAccessor.getMDR();
                    this.Acc = num;
                    this.PC++;
                    this.updateCurrent();
                    this.step = 1;
                }
                else {
                    //We do nothing here as boundaries were violated
                }
            }

            //AE - Load X register from Memory - 5 Cycles
            if(this.IR=="AE"){
                let a1=this.hexValue(_MemoryAccessor.getHOB(), 2);
                let a2=this.hexValue(_MemoryAccessor.getLOB(), 2);
                let adr=a2.concat(a1);
                let a = parseInt(adr, 16)-1;
                //If the memory boundaries are not violated, the current operation will run as normal
                //If the bounds are violated, the operation will not take place
                //Had to do it this way because without the IF statement, it would cancel the process properly if the bounds were violated, but still attempt to finish
                //the operation(ex. loading something from memory to the accumulator would set the accumulator to undefined as the memory in the segment has been wiped)
                //Even if it was not set up to reset the memory of a terminated process to all Ox00s it would instead end up violating the memory bounds anyways
                let valid:Boolean = _MemoryAccessor.checkBounds(a);
                if(valid) {
                    _MemoryAccessor.setMAR(a+ this.currentProgram.segment.offset);
                    _MemoryAccessor.read();
                    //let num = this.checkComp(_MemoryAccessor.getMDR());
                    let num = _MemoryAccessor.getMDR();
                    this.setXreg(num);
                    this.PC++;
                    this.updateCurrent();
                    this.step = 1;
                }
                else {
                    //We do noting as boundaries were violated
                }
            }

            //AC - Load Y register from Memory - 5 Cycles
            if(this.IR=="AC"){
                let a1=this.hexValue(_MemoryAccessor.getHOB(), 2);
                let a2=this.hexValue(_MemoryAccessor.getLOB(), 2);
                let adr=a2.concat(a1);
                let a = parseInt(adr, 16)-1;
                //If the memory boundaries are not violated, the current operation will run as normal
                //If the bounds are violated, the operation will not take place
                //Had to do it this way because without the IF statement, it would cancel the process properly if the bounds were violated, but still attempt to finish
                //the operation(ex. loading something from memory to the accumulator would set the accumulator to undefined as the memory in the segment has been wiped)
                //Even if it was not set up to reset the memory of a terminated process to all Ox00s it would instead end up violating the memory bounds anyways
                let valid:Boolean = _MemoryAccessor.checkBounds(a);
                if(valid) {
                    _MemoryAccessor.setMAR(a+this.currentProgram.segment.offset);
                    _MemoryAccessor.read();
                    let num = _MemoryAccessor.getMDR();
                    this.setYreg(num);
                    this.PC++;
                    this.updateCurrent();
                    this.step = 1;
                }

                else {
                    //We do nothing as the bounds were violated
                }
            }

            //AA - Load X register from Accumulator - 4 Cycles
            if(this.IR=="AA"){
                this.setXreg(this.Acc);
                this.PC++;
                this.updateCurrent();
                this.step=1;
            }

            //A8 - Load Y register from Accumulator - 4 Cycles
            if(this.IR=="A8"){
                this.setYreg(this.Acc);
                this.PC++;
                this.updateCurrent();
                this.step=1;
            }

            //8D - Store the Accumulator in Memory - 5 Cycles
            if(this.IR=="8D"){
                let a1=this.hexValue(_MemoryAccessor.getHOB(), 2);
                let a2=this.hexValue(_MemoryAccessor.getLOB(), 2);
                let adr=a2.concat(a1);
                let a = parseInt(adr, 16)-1;

                //If the memory boundaries are not violated, the current operation will run as normal
                //If the bounds are violated, the operation will not take place
                //Had to do it this way because without the IF statement, it would cancel the process properly if the bounds were violated, but still attempt to finish
                //the operation(ex. loading something from memory to the accumulator would set the accumulator to undefined as the memory in the segment has been wiped)
                //Even if it was not set up to reset the memory of a terminated process to all Ox00s it would instead end up violating the memory bounds anyways
                let valid:Boolean = _MemoryAccessor.checkBounds(a);


                if(valid){
                    _MemoryAccessor.setMAR(a+this.currentProgram.segment.offset);
                    _MemoryAccessor.setMDR(this.Acc);
                    _MemoryAccessor.write();
                    this.PC++;
                    this.updateCurrent();
                    this.step = 1;
                    TSOS.Control.UpdateMemDisplay();
                }
                else {

                }
            }

            //6D - ADD - 5 Cycles
            if(this.IR=="6D"){
                let a1=this.hexValue(_MemoryAccessor.getHOB(), 2);
                let a2=this.hexValue(_MemoryAccessor.getLOB(), 2);
                let adr=a2.concat(a1);
                let a = parseInt(adr, 16)-1;
                //If the memory boundaries are not violated, the current operation will run as normal
                //If the bounds are violated, the operation will not take place
                //Had to do it this way because without the IF statement, it would cancel the process properly if the bounds were violated, but still attempt to finish
                //the operation(ex. loading something from memory to the accumulator would set the accumulator to undefined as the memory in the segment has been wiped)
                //Even if it was not set up to reset the memory of a terminated process to all Ox00s it would instead end up violating the memory bounds anyways
                let valid:Boolean = _MemoryAccessor.checkBounds(adr);

                if(valid){
                    _MemoryAccessor.setMAR(a+this.currentProgram.segment.offset);
                    _MemoryAccessor.read();
                    let num = this.checkComp(_MemoryAccessor.getMDR());
                    //let num = this.mmu.mem.memory[parseInt(adr,16)-1];
                    //num=this.mmu.getMDR();
                    this.Acc = this.Acc + num;
                    this.PC++;
                    this.updateCurrent();
                    this.step = 1;
                }
                else {
                   //We do nothing here as boundaries were violated
                }
            }

            //EC - Compares a byte in Memory to X register - 5 Cycles
            if(this.IR=="EC"){
                let a1=this.hexValue(_MemoryAccessor.getHOB(), 2);
                let a2=this.hexValue(_MemoryAccessor.getLOB(), 2);
                let adr=a2.concat(a1);
                let a = parseInt(adr, 16)-1;
                //If the memory boundaries are not violated, the current operation will run as normal
                //If the bounds are violated, the operation will not take place
                //Had to do it this way because without the IF statement, it would cancel the process properly if the bounds were violated, but still attempt to finish
                //the operation(ex. loading something from memory to the accumulator would set the accumulator to undefined as the memory in the segment has been wiped)
                //Even if it was not set up to reset the memory of a terminated process to all Ox00s it would instead end up violating the memory bounds anyways
                let valid:Boolean = _MemoryAccessor.checkBounds(adr);
                if(valid){
                    _MemoryAccessor.setMAR(a+this.currentProgram.segment.offset);
                    _MemoryAccessor.read();
                    let byte = _MemoryAccessor.getMDR();
                    let checkX = this.getXreg();
                    if (byte == checkX) {
                        this.zFlag = 1;
                    } else {
                        this.zFlag = 0;
                    }
                    this.PC++;
                    this.updateCurrent();
                    this.step = 1;
                }
                else {
                    //We do noting here as boundaries were violated
                }
            }

            //8A - Load Accumulator from X register - 4 Cycles
            if(this.IR=="8A"){
                //let num = this.checkComp(this.getXreg());
                let num =_MemoryAccessor.getMDR();

                this.Acc =num;
                this.PC++;
                this.updateCurrent();
                this.step=1;
            }

            //98 - Load Accumulator from Y register - 4 Cycles
            if(this.IR=="98"){
                //let num = this.checkComp(this.getYreg());
                let num =_MemoryAccessor.getMDR();

                this.Acc =num;
                this.PC++;
                this.updateCurrent();
                this.step=1;
            }

            //EE - Increment a Byte in Memory - 7 Cycles
            if(this.IR=="EE"){
                let a1=this.hexValue(_MemoryAccessor.getHOB(), 2);
                let a2=this.hexValue(_MemoryAccessor.getLOB(), 2);
                let adr=a2.concat(a1);
                let a = parseInt(adr,16);
                //If the memory boundaries are not violated, the current operation will run as normal
                //If the bounds are violated, the operation will not take place
                //Had to do it this way because without the IF statement, it would cancel the process properly if the bounds were violated, but still attempt to finish
                //the operation(ex. loading something from memory to the accumulator would set the accumulator to undefined as the memory in the segment has been wiped)
                //Even if it was not set up to reset the memory of a terminated process to all Ox00s it would instead end up violating the memory bounds anyways
                let valid:Boolean = _MemoryAccessor.checkBounds(a);
                if(valid){
                    if(a+this.currentProgram.segment.offset>=20){
                        a=a-1;
                    }
                    _MemoryAccessor.setMAR(a+this.currentProgram.segment.offset);

                    _MemoryAccessor.read();
                    let num = _MemoryAccessor.getMDR();
                    this.Acc = num+1;
                    _MemoryAccessor.setMDR(this.Acc);
                    _MemoryAccessor.write();
                    //_StdOut.putText("MDR: "+_MemoryAccessor.getMDR());

                    this.updateCurrent();
                    //this.step = 5;
                    this.PC++;
                    this.step=1;
                }
                else {
                    //We do nothing as the boundaries were violated
                }
            }

            //00 - Break/Stop System
            if(this.IR=="00"){

                this.step=7;
            }

            //FF - System Call
            if(this.IR=="FF") {
                if (this.getXreg() == 1) {
                    let out = this.getYreg();
                    out = this.checkComp(out);
                    _StdOut.putText(out.toString());
                    //console.log(out.toString());
                    //this.pc++;
                    this.step = 1;
                }
                if (this.getXreg() == 2) {
                    //let tempY = this.yReg.toString(16);
                    let tempPC = this.PC++;
                    this.PC=this.yReg-1;
                    this.currentProgram.pc=this.yReg-1;
                    while(this.yReg!=0x00){
                        //output memory at spot yreg
                        //let out ="";
                    //    this.checkBounds(this.PC+this.currentProgram.segment.offset);
                        let n = _Memory.mem[this.PC+this.currentProgram.segment.offset].toString(16);

                        //out = _Memory.mem[this.yReg];
                        let output = String.fromCharCode(parseInt(n,16));
                        //_StdOut.putText(String.fromCharCode(out));
                        _StdOut.putText(output);
                        this.PC++;
                        this.updateCurrent();
                        //set yreg to value in memory
                        this.yReg=_Memory.mem[this.PC+this.currentProgram.segment.offset];

                    }
                    this.PC=tempPC;
                    //_Console.advanceLine();
                    //_OsShell.putPrompt();
                    this.step=1;
                }
            }


            //EA - No Operation
            if(this.IR=="EA"){
                //this.PC++;
                this.updateCurrent();
                this.step=1;
            }

        }

        public execute2(){
            if(this.IR=="EE"){
                this.Acc =this.Acc +1;
                this.step=6;
            }
        }

        public checkComp(hex:number){
            if(hex>127){
                //2's comp it
                const bin=hex.toString(2);
                const decimal = parseInt(bin,2);
                const numBits = bin.length
                let p = 0x80000000 >> (32 - numBits);
                let num = p | decimal;
                return num+1;
            }
            else{
                return hex;
            }
        }

        public hexValue(number:number, size:number): string{
            let temp: string = number.toString(16);
            let num: string = temp.toUpperCase()+"";
            while(num.length < size){
                num="0"+num;
            }
            return num;
        }

        public writeBack(){
            if(this.IR=="EE"){
                let a1=this.hexValue(_MemoryAccessor.getHOB(), 2);
                let a2=this.hexValue(_MemoryAccessor.getLOB(), 2);
                let adr=a2.concat(a1);
                _MemoryAccessor.setMAR(parseInt(adr,16)+this.currentProgram.segment.offset);
                _MemoryAccessor.setMDR(this.Acc);
                _MemoryAccessor.write();
                _StdOut.putText("MAR: "+_MemoryAccessor.getMAR()+" MDR: "+_MemoryAccessor.getMDR());
                //this.mmu.mem.memory[parseInt(adr,16)-1]=this.acc;
                this.PC++;
                this.updateCurrent();
                this.step=1;
            }

        }



        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            //Kills Program if it goes out of its Memory Range
           // if(this.PC>this.currentProgram.End || this.PC < this.currentProgram.Start){
            //    this.kill();
          //  }
            if(this.PC>255 || this.PC<0){
                _StdOut.putText("Error: PC Invalid! Prepare for Neurotoxin!");
                this.step=7;
            }


            //Fetch
            if(this.step==1){

                //Call the scheduler and check whether or not the quantum has been used up
                //if so, contact dispatcher to start a context switch
                //go forth with fetch after switch(if switched)
                if(_Scheduler.roundRobin()){
                    //Do nothing
                }
                else {
                    //Turnaround and Wait Time
                    this.currentProgram.turnaround++;
                    for(let i =0;i<readyqueue.getSize();i++){
                        let prog = readyqueue.dequeue();
                        prog.wait++;
                        prog.turnaround++;
                        readyqueue.enqueue(prog);
                    }
                    this.fetch();
                    //after we have fetched we will increment the programs quantum.
                    //we do it afterwards to ensure the program gets the correct amount of runs through
                    this.currentProgram.quanta++;
                }

            }
            //Decode1
            else if(this.step==2){
                this.decode1();

            }
            //Decode2
            else if(this.step==3){
                this.decode2();

            }
            //Execute1
            else if(this.step==4){
                this.execute1();

            }
            //Execute2
            else if(this.step==5){
                this.execute2();

            }
            //WriteBack
            else if(this.step==6){
                this.writeBack();

            }
            else if(this.step==7){
                //this.currentProgram.state='terminated';
                //_Scheduler.programEnd(this.currentProgram,false);
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(PROGRAM_END, [this.currentProgram,false]));
                //this.programEnd();
            }

            TSOS.Control.updatePCB(this.currentProgram);
            TSOS.Control.UpdateMemDisplay();

            // Do the real work here. Be sure to set this.isExecuting appropriately.
        }
    }
}
