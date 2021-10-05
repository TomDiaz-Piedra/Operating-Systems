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
        constructor(PC = 0, Acc = 0, step, IR, xReg = 0, yReg = 0, zFlag = 0, isExecuting = false) {
            this.PC = PC;
            this.Acc = Acc;
            this.step = step;
            this.IR = IR;
            this.xReg = xReg;
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
            _MemoryAccessor.setMAR(this.PC);
            _MemoryAccessor.read();
            this.IR = _MemoryAccessor.getMDR();
            //increment program counter
            this.PC++;
            this.step = 2;
        }
        decode1() {
            if (this.IR == 0xAD || this.IR == 0x8D || this.IR == 0x6D || this.IR == 0xAE || this.IR == 0xAC || this.IR == 0xEC || this.IR == 0xEE) {
                //this.mmu.setHOB(this.mmu.mem.memory[this.pc]);
                _MemoryAccessor.setMAR(this.PC);
                _MemoryAccessor.read();
                _MemoryAccessor.setHOB(_MemoryAccessor.getMDR());
                this.PC++;
                this.step = 3;
            }
            else {
                this.step = 4;
            }
        }
        decode2() {
            //this.mmu.setLOB(this.mmu.mem.memory[this.pc]);
            _MemoryAccessor.setMAR(this.PC);
            _MemoryAccessor.read();
            _MemoryAccessor.setLOB(_MemoryAccessor.getMDR());
            this.step = 4;
        }
        execute1() {
            //A9 - Load Accumulator with a Constant - 4 CPU Cycles
            if (this.IR == 0xA9) {
                //this.acc=this.mmu.mem.memory[this.pc];
                _MemoryAccessor.setMAR(this.PC);
                _MemoryAccessor.read();
                let num = this.checkComp(_MemoryAccessor.getMDR());
                this.Acc = num;
                this.PC++;
                //this.step=7;
            }
            //A2 - Load X register with a constant - 4 CPU Cycles
            if (this.IR == 0xA2) {
                _MemoryAccessor.setMAR(this.PC);
                _MemoryAccessor.read();
                let num = this.checkComp(_MemoryAccessor.getMDR());
                this.setXreg(num);
                //this.setXreg(this.mmu.mem.memory[this.pc]);
                this.PC++;
                //this.step=7;
            }
            //A0 - Load Y register with a constant - 4 CPU Cycles
            if (this.IR == 0xA0) {
                _MemoryAccessor.setMAR(this.PC);
                _MemoryAccessor.read();
                let num = this.checkComp(_MemoryAccessor.getMDR());
                this.setYreg(num);
                //this.setYreg(this.mmu.mem.memory[this.pc]);
                this.PC++;
                //this.step=7;
            }
            //D0 - Branch N Bytes
            if (this.IR == 0xD0) {
                if (this.zFlag == 1) {
                    this.PC++;
                    //this.step=7;
                }
                if (this.zFlag == 0) {
                    _MemoryAccessor.setMAR(this.PC);
                    _MemoryAccessor.read();
                    const hex = _MemoryAccessor.getMDR();
                    let offset = this.checkComp(hex);
                    this.PC = this.PC + offset;
                    //this.step=7;
                }
            }
            //AD - Load Accumulator from Memory - 5 Cycles
            if (this.IR == 0xAD) {
                let adr = this.hexValue(_MemoryAccessor.getLOB(), 2).concat(this.hexValue(_MemoryAccessor.getHOB(), 2));
                let a = parseInt(adr, 16) - 1;
                _MemoryAccessor.setMAR(a);
                _MemoryAccessor.read();
                let num = this.checkComp(_MemoryAccessor.getMDR());
                this.Acc = num;
                this.PC++;
                //this.step=7;
            }
            //AE - Load X register from Memory - 5 Cycles
            if (this.IR == 0xAE) {
                let adr = this.hexValue(_MemoryAccessor.getLOB(), 2).concat(this.hexValue(_MemoryAccessor.getHOB(), 2));
                _MemoryAccessor.setMAR(parseInt(adr, 16) - 1);
                _MemoryAccessor.read();
                let num = this.checkComp(_MemoryAccessor.getMDR());
                this.setXreg(num);
                //this.setXreg(this.mmu.mem.memory[parseInt(adr,16)-1]);
                this.PC++;
                //this.step=7;
            }
            //AC - Load Y register from Memory - 5 Cycles
            if (this.IR == 0xAC) {
                let adr = this.hexValue(_MemoryAccessor.getLOB(), 2).concat(this.hexValue(_MemoryAccessor.getHOB(), 2));
                _MemoryAccessor.setMAR(parseInt(adr, 16) - 1);
                _MemoryAccessor.read();
                let num = this.checkComp(_MemoryAccessor.getMDR());
                this.setYreg(num);
                //this.setYreg(this.mmu.mem.memory[parseInt(adr,16)-1]);
                this.PC++;
                //this.step=7;
            }
            //AA - Load X register from Accumulator - 4 Cycles
            if (this.IR == 0xAA) {
                this.setXreg(this.Acc);
                this.PC++;
                //this.step=7;
            }
            //A8 - Load Y register from Accumulator - 4 Cycles
            if (this.IR == 0xA8) {
                this.setYreg(this.Acc);
                this.PC++;
                //this.step=7;
            }
            //8D - Store the Accumulator in Memory - 5 Cycles
            if (this.IR == 0x8D) {
                let a1 = this.hexValue(_MemoryAccessor.getHOB(), 2);
                let a2 = this.hexValue(_MemoryAccessor.getLOB(), 2);
                let adr = a2.concat(a1);
                _MemoryAccessor.setMAR(parseInt(adr, 16) - 1);
                _MemoryAccessor.setMDR(this.Acc);
                _MemoryAccessor.write();
                //this.mmu.mem.memory[parseInt(adr,16)-1]=this.acc;
                this.PC++;
                //this.step=7;
            }
            //6D - ADD - 5 Cycles
            if (this.IR == 0x6D) {
                let a1 = this.hexValue(_MemoryAccessor.getHOB(), 2);
                let a2 = this.hexValue(_MemoryAccessor.getLOB(), 2);
                let adr = a2.concat(a1);
                _MemoryAccessor.setMAR(parseInt(adr, 16) - 1);
                _MemoryAccessor.read();
                let num = this.checkComp(_MemoryAccessor.getMDR());
                //let num = this.mmu.mem.memory[parseInt(adr,16)-1];
                //num=this.mmu.getMDR();
                this.Acc = this.Acc + num;
                this.PC++;
                //this.step=7;
            }
            //EC - Compares a byte in Memory to X register - 5 Cycles
            if (this.IR == 0xEC) {
                let a1 = this.hexValue(_MemoryAccessor.getHOB(), 2);
                let a2 = this.hexValue(_MemoryAccessor.getLOB(), 2);
                let adr = a2.concat(a1);
                _MemoryAccessor.setMAR(parseInt(adr, 16) - 1);
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
                //this.step=7;
            }
            //8A - Load Accumulator from X register - 4 Cycles
            if (this.IR == 0x8A) {
                let num = this.checkComp(this.getXreg());
                this.Acc = num;
                this.PC++;
                //this.step=7;
            }
            //98 - Load Accumulator from Y register - 4 Cycles
            if (this.IR == 0x98) {
                let num = this.checkComp(this.getYreg());
                this.Acc = num;
                this.PC++;
                //this.step=7;
            }
            //EE - Increment a Byte in Memory - 7 Cycles
            if (this.IR == 0xEE) {
                let a1 = this.hexValue(_MemoryAccessor.getHOB(), 2);
                let a2 = this.hexValue(_MemoryAccessor.getLOB(), 2);
                let adr = a2.concat(a1);
                _MemoryAccessor.setMAR(parseInt(adr, 16) - 1);
                _MemoryAccessor.read();
                let num = this.checkComp(_MemoryAccessor.getMDR());
                this.Acc = num;
                //this.acc=this.mmu.mem.memory[parseInt(adr,16)-1];
                this.step = 5;
            }
            //00 - Break/Stop System
            if (this.IR == 0x00) {
                //this.clock.stop();
            }
            //FF - System Call
            if (this.IR == 0xFF) {
                if (this.getXreg() == 1) {
                    let out = this.getYreg();
                    out = this.checkComp(out);
                    _StdOut.putText(out.toString());
                    //console.log(out.toString());
                    //this.pc++;
                    //this.step=7;
                }
                if (this.getXreg() == 2) {
                    _MemoryAccessor.setMAR(this.PC);
                    _MemoryAccessor.read();
                    this.PC = _MemoryAccessor.getMDR();
                    this.IR = _MemoryAccessor.getMDR();
                    while (this.IR !== 0x00) {
                        _MemoryAccessor.setMAR(this.PC);
                        _MemoryAccessor.read();
                        this.PC = _MemoryAccessor.getMAR();
                        let str = parseInt(String(_MemoryAccessor.getMDR()), 10);
                        if (str > 30 && str < 128) {
                            // @ts-ignore
                            _StdOut.putText(this.ascii.byteToStr(str));
                        }
                        else {
                            _StdOut.putText(str.toString(16));
                        }
                        this.PC++;
                        _MemoryAccessor.setMAR(this.PC);
                        _MemoryAccessor.read();
                        this.IR = _MemoryAccessor.getMDR();
                    }
                    //this.step=7;
                }
            }
            //EA - No Operation
            if (this.IR == 0xEA) {
                this.PC++;
                //this.step=7;
            }
        }
        execute2() {
            if (this.IR == 0xEE) {
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
            if (this.IR == 0xEE) {
                let a1 = this.hexValue(_MemoryAccessor.getHOB(), 2);
                let a2 = this.hexValue(_MemoryAccessor.getLOB(), 2);
                let adr = a2.concat(a1);
                _MemoryAccessor.setMAR(parseInt(adr, 16) - 1);
                _MemoryAccessor.setMDR(this.Acc);
                _MemoryAccessor.write();
                //this.mmu.mem.memory[parseInt(adr,16)-1]=this.acc;
                this.PC++;
                //this.step=7;
            }
        }
        cycle() {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            //Fetch
            if (this.step == 1) {
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
            // Do the real work here. Be sure to set this.isExecuting appropriately.
        }
    }
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=cpu.js.map