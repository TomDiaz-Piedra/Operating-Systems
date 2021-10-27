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
var TSOS;
(function (TSOS) {
    class Cpu {
        constructor(PC = 0, Acc = 0, step = 1, IR, xReg = 0, currentProgram, yReg = 0, zFlag = 0, isExecuting = false) {
            this.PC = PC;
            this.Acc = Acc;
            this.step = step;
            this.IR = IR;
            this.xReg = xReg;
            this.currentProgram = currentProgram;
            this.yReg = yReg;
            this.zFlag = zFlag;
            this.isExecuting = isExecuting;
        }
        init() {
            this.PC = 0;
            this.Acc = 0;
            this.IR = this.IR;
            this.step = this.step;
            this.xReg = 0;
            this.yReg = 0;
            this.zFlag = 0;
            this.isExecuting = false;
        }
        startCPU() {
            //this.currentProgram=null;
            let program = readyqueue.dequeue();
            this.currentProgram = program;
            //this.loadProgramState();
            this.PC = this.currentProgram.pc;
            this.step = 1;
            this.currentProgram.state = "running";
            TSOS.Control.updatePCB(this.currentProgram);
            this.isExecuting = true;
        }
        newProgram() {
            let newProg = readyqueue.dequeue();
            this.currentProgram = newProg;
            this.PC = this.currentProgram.pc;
            this.Acc = this.currentProgram.acc;
            this.xReg = this.currentProgram.xReg;
            this.yReg = this.currentProgram.yReg;
            this.zFlag = this.currentProgram.zReg;
            this.IR = this.currentProgram.IR;
            this.step = 1;
            this.currentProgram.state = "running";
            TSOS.Control.updatePCB(this.currentProgram);
            this.isExecuting = true;
        }
        programEnd() {
            _MemoryAccessor.clearSegment(this.currentProgram.segment.Number);
            this.currentProgram.state = "terminated";
            TSOS.Control.updatePCB(this.currentProgram);
            let done = readyqueue.isEmpty();
            if (done) {
                this.isExecuting = false;
            }
            else {
                this.isExecuting = false;
                this.newProgram();
            }
        }
        //Terminates current program in CPU
        kill() {
            this.currentProgram.state = "Killed"; //maybe change to kill for fun idk
            TSOS.Control.updatePCB(this.currentProgram);
            _MemoryAccessor.clearSegment(this.currentProgram.segment.Number);
            //Turns off cpu if readyqueue is empty, keeps on and starts with next if not
            this.programEnd();
        }
        killAll() {
            this.kill();
            while (!readyqueue.isEmpty()) {
                let killedProg = readyqueue.dequeue();
                _MemoryAccessor.clearMem();
                killedProg.state = "Killed";
                TSOS.Control.updatePCB(this.currentProgram);
            }
        }
        killSpecific(pid) {
            let pcb = _ProcessControlBlock.getPCB(pid);
            for (let i = 0; i < readyqueue.getSize(); i++) {
                let temp = readyqueue.dequeue();
                if (temp.pid == pid) {
                    temp.state = "Killed";
                    TSOS.Control.updatePCB(this.currentProgram);
                }
                else {
                    readyqueue.enqueue(temp);
                }
            }
        }
        updateCurrent() {
            this.currentProgram.pc = this.PC;
            this.currentProgram.ir = this.IR;
            this.currentProgram.acc = this.Acc;
            this.currentProgram.xReg = this.xReg;
            this.currentProgram.yReg = this.yReg;
            this.currentProgram.zReg = this.zFlag;
        }
        //Getters and Setters for the X and Y registers
        setXreg(xReg) {
            this.xReg = xReg;
        }
        setYreg(yReg) {
            this.yReg = yReg;
        }
        getXreg() {
            return this.xReg;
        }
        getYreg() {
            return this.yReg;
        }
        fetch() {
            //get op code from code at position program counter
            //this.op=this.mmu.mem.memory[this.pc];
            _MemoryAccessor.setMAR(this.PC + this.currentProgram.segment.offset);
            _MemoryAccessor.read();
            this.IR = _MemoryAccessor.getMDR().toString(16).toUpperCase();
            if (this.IR == "0" || this.IR == "3") { // The 3 check is only there temporarily as i debug it
                this.IR = "00";
                this.step = 7;
            }
            //increment program counter
            this.PC++;
            this.updateCurrent();
            this.step = 2;
        }
        decode1() {
            if (this.IR == "AD" || this.IR == "8D" || this.IR == "6D" || this.IR == "AE" || this.IR == "AC" || this.IR == "EC" || this.IR == "EE") {
                //this.mmu.setHOB(this.mmu.mem.memory[this.pc]);
                _MemoryAccessor.setMAR(this.PC + this.currentProgram.segment.offset);
                _MemoryAccessor.read();
                _MemoryAccessor.setHOB(_MemoryAccessor.getMDR());
                this.PC++;
                this.updateCurrent();
                this.step = 3;
            }
            else {
                this.step = 4;
            }
        }
        decode2() {
            //this.mmu.setLOB(this.mmu.mem.memory[this.pc]);
            _MemoryAccessor.setMAR(this.PC + this.currentProgram.segment.offset);
            _MemoryAccessor.read();
            _MemoryAccessor.setLOB(_MemoryAccessor.getMDR());
            this.step = 4;
        }
        execute1() {
            //A9 - Load Accumulator with a Constant - 4 CPU Cycles
            if (this.IR == "A9") {
                //this.acc=this.mmu.mem.memory[this.pc];
                _MemoryAccessor.setMAR(this.PC + this.currentProgram.segment.offset);
                _MemoryAccessor.read();
                //let num = this.checkComp(_MemoryAccessor.getMDR());
                let num = _MemoryAccessor.getMDR();
                this.Acc = num;
                this.PC++;
                this.updateCurrent();
                this.step = 1;
            }
            //A2 - Load X register with a constant - 4 CPU Cycles
            if (this.IR == "A2") {
                _MemoryAccessor.setMAR(this.PC + this.currentProgram.segment.offset);
                _MemoryAccessor.read();
                //let num = this.checkComp(_MemoryAccessor.getMDR());
                let num = _MemoryAccessor.getMDR();
                this.setXreg(num);
                //this.setXreg(this.mmu.mem.memory[this.pc]);
                this.PC++;
                this.updateCurrent();
                this.step = 1;
            }
            //A0 - Load Y register with a constant - 4 CPU Cycles
            if (this.IR == "A0") {
                _MemoryAccessor.setMAR(this.PC + this.currentProgram.segment.offset);
                _MemoryAccessor.read();
                //let num = this.checkComp(_MemoryAccessor.getMDR());
                let num = _MemoryAccessor.getMDR();
                this.setYreg(num);
                //this.setYreg(this.mmu.mem.memory[this.pc]);
                this.PC++;
                this.updateCurrent();
                this.step = 1;
            }
            //D0 - Branch N Bytes
            if (this.IR == "D0") {
                if (this.zFlag == 1) {
                    this.PC++;
                    this.updateCurrent();
                    this.step = 1;
                }
                if (this.zFlag == 0) {
                    //this.PC++;
                    _MemoryAccessor.setMAR(this.PC + this.currentProgram.segment.offset);
                    _MemoryAccessor.read();
                    const hex = _MemoryAccessor.getMDR();
                    let offset = this.checkComp(hex);
                    if (offset > 0) {
                        offset = offset + 1;
                    }
                    this.PC = this.PC + offset;
                    if (this.PC > 255) {
                        this.PC = this.PC - 256;
                    }
                    if (this.PC < 0) {
                        this.kill();
                    }
                    this.updateCurrent();
                    this.step = 1;
                }
            }
            //AD - Load Accumulator from Memory - 5 Cycles
            if (this.IR == "AD") {
                let adr = this.hexValue(_MemoryAccessor.getLOB(), 2).concat(this.hexValue(_MemoryAccessor.getHOB(), 2));
                let a = parseInt(adr, 16) - 1;
                _MemoryAccessor.setMAR(a + this.currentProgram.segment.offset);
                _MemoryAccessor.read();
                //let num = this.checkComp(_MemoryAccessor.getMDR());
                let num = _MemoryAccessor.getMDR();
                this.Acc = num;
                this.PC++;
                this.updateCurrent();
                this.step = 1;
            }
            //AE - Load X register from Memory - 5 Cycles
            if (this.IR == "AE") {
                let adr = this.hexValue(_MemoryAccessor.getLOB(), 2).concat(this.hexValue(_MemoryAccessor.getHOB(), 2));
                _MemoryAccessor.setMAR(parseInt(adr, 16) - 1 + this.currentProgram.segment.offset);
                _MemoryAccessor.read();
                //let num = this.checkComp(_MemoryAccessor.getMDR());
                let num = _MemoryAccessor.getMDR();
                this.setXreg(num);
                //this.setXreg(this.mmu.mem.memory[parseInt(adr,16)-1]);
                this.PC++;
                this.updateCurrent();
                this.step = 1;
            }
            //AC - Load Y register from Memory - 5 Cycles
            if (this.IR == "AC") {
                let adr = this.hexValue(_MemoryAccessor.getLOB(), 2).concat(this.hexValue(_MemoryAccessor.getHOB(), 2));
                _MemoryAccessor.setMAR(parseInt(adr, 16) - 1 + this.currentProgram.segment.offset);
                _MemoryAccessor.read();
                //let num = this.checkComp(_MemoryAccessor.getMDR());
                let num = _MemoryAccessor.getMDR();
                this.setYreg(num);
                //this.setYreg(this.mmu.mem.memory[parseInt(adr,16)-1]);
                this.PC++;
                this.updateCurrent();
                this.step = 1;
            }
            //AA - Load X register from Accumulator - 4 Cycles
            if (this.IR == "AA") {
                this.setXreg(this.Acc);
                this.PC++;
                this.updateCurrent();
                this.step = 1;
            }
            //A8 - Load Y register from Accumulator - 4 Cycles
            if (this.IR == "A8") {
                this.setYreg(this.Acc);
                this.PC++;
                this.updateCurrent();
                this.step = 1;
            }
            //8D - Store the Accumulator in Memory - 5 Cycles
            if (this.IR == "8D") {
                let a1 = this.hexValue(_MemoryAccessor.getHOB(), 2);
                let a2 = this.hexValue(_MemoryAccessor.getLOB(), 2);
                let adr = a2.concat(a1);
                _MemoryAccessor.setMAR(parseInt(adr, 16) - 1 + this.currentProgram.segment.offset);
                _MemoryAccessor.setMDR(this.Acc);
                _MemoryAccessor.write();
                //this.mmu.mem.memory[parseInt(adr,16)-1]=this.acc;
                this.PC++;
                this.updateCurrent();
                this.step = 1;
                TSOS.Control.UpdateMemDisplay();
            }
            //6D - ADD - 5 Cycles
            if (this.IR == "6D") {
                let a1 = this.hexValue(_MemoryAccessor.getHOB(), 2);
                let a2 = this.hexValue(_MemoryAccessor.getLOB(), 2);
                let adr = a2.concat(a1);
                _MemoryAccessor.setMAR(parseInt(adr, 16) - 1 + this.currentProgram.segment.offset);
                _MemoryAccessor.read();
                let num = this.checkComp(_MemoryAccessor.getMDR());
                //let num = this.mmu.mem.memory[parseInt(adr,16)-1];
                //num=this.mmu.getMDR();
                this.Acc = this.Acc + num;
                this.PC++;
                this.updateCurrent();
                this.step = 1;
            }
            //EC - Compares a byte in Memory to X register - 5 Cycles
            if (this.IR == "EC") {
                let a1 = this.hexValue(_MemoryAccessor.getHOB(), 2);
                let a2 = this.hexValue(_MemoryAccessor.getLOB(), 2);
                let adr = a2.concat(a1);
                _MemoryAccessor.setMAR(parseInt(adr, 16) - 1 + this.currentProgram.segment.offset);
                _MemoryAccessor.read();
                let byte = _MemoryAccessor.getMDR();
                //let byte = this.mmu.mem.memory[parseInt(adr,16)-1];
                let checkX = this.getXreg();
                if (byte == checkX) {
                    this.zFlag = 1;
                }
                else {
                    this.zFlag = 0;
                }
                this.PC++;
                this.updateCurrent();
                this.step = 1;
            }
            //8A - Load Accumulator from X register - 4 Cycles
            if (this.IR == "8A") {
                //let num = this.checkComp(this.getXreg());
                let num = _MemoryAccessor.getMDR();
                this.Acc = num;
                this.PC++;
                this.updateCurrent();
                this.step = 1;
            }
            //98 - Load Accumulator from Y register - 4 Cycles
            if (this.IR == "98") {
                //let num = this.checkComp(this.getYreg());
                let num = _MemoryAccessor.getMDR();
                this.Acc = num;
                this.PC++;
                this.updateCurrent();
                this.step = 1;
            }
            //EE - Increment a Byte in Memory - 7 Cycles
            if (this.IR == "EE") {
                let a1 = this.hexValue(_MemoryAccessor.getHOB(), 2);
                let a2 = this.hexValue(_MemoryAccessor.getLOB(), 2);
                let adr = a2.concat(a1);
                _MemoryAccessor.setMAR(parseInt(adr, 16) - 1 + this.currentProgram.segment.offset);
                _MemoryAccessor.read();
                //let num = this.checkComp(_MemoryAccessor.getMDR());
                let num = _MemoryAccessor.getMDR();
                this.Acc = num;
                this.updateCurrent();
                //this.acc=this.mmu.mem.memory[parseInt(adr,16)-1];
                this.step = 5;
            }
            //00 - Break/Stop System
            if (this.IR == "00") {
                //this.currentProgram.state="terminated";
                //_MemoryAccessor.clearSegment(this.currentProgram.segment.Number);
                //this.currentProgram.state="terminated";
                //this.updateCurrent();
                this.step = 7;
            }
            //FF - System Call
            if (this.IR == "FF") {
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
                    this.PC = this.yReg - 1;
                    this.currentProgram.pc = this.yReg - 1;
                    while (this.yReg != 0x00) {
                        //output memory at spot yreg
                        //let out ="";
                        let n = _Memory.mem[this.PC + this.currentProgram.segment.offset].toString(16);
                        //out = _Memory.mem[this.yReg];
                        let output = String.fromCharCode(parseInt(n, 16));
                        //_StdOut.putText(String.fromCharCode(out));
                        _StdOut.putText(output);
                        this.PC++;
                        this.updateCurrent();
                        //set yreg to value in memory
                        this.yReg = _Memory.mem[this.PC + this.currentProgram.segment.offset];
                    }
                    this.PC = tempPC;
                    //_Console.advanceLine();
                    //_OsShell.putPrompt();
                    this.step = 1;
                }
            }
            //EA - No Operation
            if (this.IR == "EA") {
                //this.PC++;
                this.updateCurrent();
                this.step = 1;
            }
        }
        execute2() {
            if (this.IR == "EE") {
                this.Acc = this.Acc + 1;
                this.step = 6;
            }
        }
        checkComp(hex) {
            if (hex > 127) {
                //2's comp it
                const bin = hex.toString(2);
                const decimal = parseInt(bin, 2);
                const numBits = bin.length;
                let p = 0x80000000 >> (32 - numBits);
                let num = p | decimal;
                return num + 1;
            }
            else {
                return hex;
            }
        }
        hexValue(number, size) {
            let temp = number.toString(16);
            let num = temp.toUpperCase() + "";
            while (num.length < size) {
                num = "0" + num;
            }
            return num;
        }
        writeBack() {
            if (this.IR == "EE") {
                let a1 = this.hexValue(_MemoryAccessor.getHOB(), 2);
                let a2 = this.hexValue(_MemoryAccessor.getLOB(), 2);
                let adr = a2.concat(a1);
                _MemoryAccessor.setMAR(parseInt(adr, 16) - 1 + this.currentProgram.segment.offset);
                _MemoryAccessor.setMDR(this.Acc);
                _MemoryAccessor.write();
                //this.mmu.mem.memory[parseInt(adr,16)-1]=this.acc;
                this.PC++;
                this.updateCurrent();
                this.step = 1;
            }
        }
        cycle() {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            //Kills Program if it goes out of its Memory Range
            // if(this.PC>this.currentProgram.End || this.PC < this.currentProgram.Start){
            //    this.kill();
            //  }
            //Fetch
            if (this.step == 1) {
                //Call the scheduler and check whether or not the quantum has been used up
                //if so, contact dispatcher to start a context switch
                //go forth with fetch after switch(if switched)
                this.fetch();
            }
            //Decode1
            else if (this.step == 2) {
                this.decode1();
            }
            //Decode2
            else if (this.step == 3) {
                this.decode2();
            }
            //Execute1
            else if (this.step == 4) {
                this.execute1();
            }
            //Execute2
            else if (this.step == 5) {
                this.execute2();
            }
            //WriteBack
            else if (this.step == 6) {
                this.writeBack();
            }
            else if (this.step == 7) {
                this.programEnd();
            }
            else if (this.PC >= this.currentProgram.End) {
                this.currentProgram.state = "Killed";
                //readyqueue.dequeue();
            }
            TSOS.Control.updatePCB(this.currentProgram);
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map