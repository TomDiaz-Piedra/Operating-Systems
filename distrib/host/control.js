/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */
//
// Control Services
//
var TSOS;
(function (TSOS) {
    class Control {
        static hostInit() {
            // This is called from index.html's onLoad event via the onDocumentLoad function pointer.
            // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
            _Canvas = document.getElementById('display');
            // Get a global reference to the drawing context.
            _DrawingContext = _Canvas.getContext("2d");
            // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
            TSOS.CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.
            // Clear the log text box.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("taHostLog").value = "";
            // Set focus on the start button.
            // Use the TypeScript cast to HTMLInputElement
            document.getElementById("btnStartOS").focus();
            // Check for our testing and enrichment core, which
            // may be referenced here (from index.html) as function Glados().
            if (typeof Glados === "function") {
                // function Glados() is here, so instantiate Her into
                // the global (and properly capitalized) _GLaDOS variable.
                _GLaDOS = new Glados();
                _GLaDOS.init();
            }
        }
        //memInt will initialize the display memory.
        // We call this method only once; which is when the Start button is pressed
        static memInit() {
            var table = document.getElementById('tableMemory');
            // 8 rows
            //_Memory.mem.length / 8
            for (var i = 0; i < _Memory.mem.length / 8; i++) {
                var row = table.insertRow(i);
                var memoryAddrCell = row.insertCell(0);
                var address = i * 8;
                // Formats to proper hex
                var displayAddress = "0x";
                for (var k = 0; k < 3 - address.toString(16).length; k++) {
                    displayAddress += "0";
                }
                displayAddress += address.toString(16).toUpperCase();
                memoryAddrCell.innerHTML = displayAddress;
                // Fill all the cells with 00s
                for (var j = 1; j < 9; j++) {
                    var cell = row.insertCell(j);
                    cell.innerHTML = "00";
                    cell.classList.add("memoryCell");
                }
            }
        }
        static addPcb(pcb) {
            var pcbTable = document.getElementById("pcbTable");
            var r = 3;
            let pcbRow = pcbTable.insertRow(r);
            pcbRow.className = pcb.pid;
            r++;
            let pid = pcbRow.insertCell(0);
            pid.innerHTML = pcb.pid;
            let state = pcbRow.insertCell(1);
            state.innerHTML = pcb.state;
            let pc = pcbRow.insertCell(2);
            pc.innerHTML = pcb.pc;
            let ir = pcbRow.insertCell(3);
            ir.innerHTML = pcb.IR;
            let acc = pcbRow.insertCell(4);
            acc.innerHTML = pcb.acc;
            let xreg = pcbRow.insertCell(5);
            xreg.innerHTML = pcb.xReg;
            let yreg = pcbRow.insertCell(6);
            yreg.innerHTML = pcb.yReg;
            let zflag = pcbRow.insertCell(7);
            zflag.innerHTML = pcb.zReg;
            let location = pcbRow.insertCell(8);
            location.innerHTML = pcb.location;
            //cell.innerHTML="0";
            //cell.classList.add("pcb"+i.toString());
        }
        static updatePCB(pcb) {
            let pcbTable = document.getElementById("pcbTable");
            let r;
            for (let i = 0; i < pcbTable.rows.length; i++) {
                if (pcb.pid == pcbTable.rows[i].className) {
                    r = pcbTable.rows[i];
                }
            }
            let pid = r.cells[0];
            pid.innerHTML = pcb.pid;
            let state = r.cells[1];
            state.innerHTML = pcb.state;
            let pc = r.cells[2];
            pc.innerHTML = pcb.pc.toString(16).toUpperCase();
            let ir = r.cells[3];
            ir.innerHTML = pcb.IR;
            let acc = r.cells[4];
            acc.innerHTML = pcb.acc.toString(16).toUpperCase();
            let xreg = r.cells[5];
            xreg.innerHTML = pcb.xReg.toString(16).toUpperCase();
            let yreg = r.cells[6];
            yreg.innerHTML = pcb.yReg.toString(16).toUpperCase();
            let zflag = r.cells[7];
            zflag.innerHTML = pcb.zReg.toString(16).toUpperCase();
            let location = r.cells[8];
            location.innerHTML = pcb.location;
        }
        static hostLog(msg, source = "?") {
            // Note the OS CLOCK.
            var clock = _OSclock;
            // Note the REAL clock in milliseconds since January 1, 1970.
            var now = new Date().getTime();
            // Build the log string.
            var str = "({ clock:" + clock + ", source:" + source + ", msg:" + msg + ", now:" + now + " })" + "\n";
            // Update the log console.
            var taLog = document.getElementById("taHostLog");
            taLog.value = str + taLog.value;
            // TODO in the future: Optionally update a log database or some streaming service.
        }
        //
        // Host Events
        //
        static hostBtnStartOS_click(btn) {
            // Disable the (passed-in) start button...
            btn.disabled = true;
            // .. enable the Halt and Reset buttons ...
            document.getElementById("btnHaltOS").disabled = false;
            document.getElementById("btnReset").disabled = false;
            // .. set focus on the OS console display ...
            document.getElementById("display").focus();
            function updateClock() {
                let n = new Date(); // current date
                let time = n.getHours() + ':' + n.getMinutes() + ":" + n.getSeconds();
                let date = (n.getUTCMonth() + 1) + "/" + n.getUTCDate() + "/" + n.getFullYear();
                // set the content of the element with the ID time to the formatted string
                document.getElementById('time').innerHTML = time;
                document.getElementById('date').innerHTML = date;
            }
            setInterval(updateClock, 1000);
            //Initialize Status Message
            document.getElementById("status").innerHTML = "Potato";
            // ... Create and initialize the CPU (because it's part of the hardware)  ...
            _CPU = new TSOS.Cpu(0, 0, 1, "0", 0, 0, 0, 0, false); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
            _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.
            _Memory = new TSOS.Memory();
            _Memory.init();
            _MemoryAccessor = new TSOS.MemoryAccessor();
            _MemoryManager = new TSOS.MemoryManager();
            _ProcessControlBlock = new TSOS.processControlBlock();
            readyqueue = new TSOS.Queue();
            residentqueue = new TSOS.Queue();
            _Swapper = new TSOS.swapper();
            _Scheduler = new TSOS.Scheduler();
            _Dispatcher = new TSOS.Dispatcher();
            _Disk = new TSOS.Disk();
            _Disk.init();
            // ... then set the host clock pulse ...
            _hardwareClockID = setInterval(TSOS.Devices.hostClockPulse, CPU_CLOCK_INTERVAL);
            // .. and call the OS Kernel Bootstrap routine.
            _Kernel = new TSOS.Kernel();
            _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
        }
        static hostBtnHaltOS_click(btn) {
            Control.hostLog("Emergency halt", "host");
            Control.hostLog("Attempting Kernel shutdown.", "host");
            // Call the OS shutdown routine.
            _Kernel.krnShutdown();
            // Stop the interval that's simulating our clock pulse.
            clearInterval(_hardwareClockID);
            // TODO: Is there anything else we need to do here?
        }
        static hostBtnReset_click(btn) {
            // The easiest and most thorough way to do this is to reload (not refresh) the document.
            location.reload();
            // That boolean parameter is the 'forceget' flag. When it is true it causes the page to always
            // be reloaded from the server. If it is false or not specified the browser may reload the
            // page from its cache, which is not what we want.
        }
        //Updates the memory display we initialize at start
        static UpdateMemDisplay() {
            var table = document.getElementById('tableMemory');
            var data = 0;
            for (var i = 0; i < table.rows.length; i++) {
                for (var j = 1; j < 9; j++) {
                    let d = parseInt(String(_Memory.mem[data]));
                    table.rows[i].cells.item(j).innerHTML = d.toString(16).toUpperCase();
                    table.rows[i].cells.item(j).style.color = "black";
                    table.rows[i].cells.item(j).style['font-weight'] = "normal";
                    //Formatting memory, works for now. If some value makes the display look bad I will need to fix this
                    //NOTE: IF MEMORY FORMAT LOOKS BAD FIX THIS TOM!!!!!!!
                    var dec = parseInt(_Memory.mem[data]);
                    //.toString(), 16)
                    //var dec = String(parseInt(String(_Memory.mem[data],16);
                    if (dec < 16 && dec >= 0) {
                        table.rows[i].cells.item(j).innerHTML = "0" + dec.toString(16).toUpperCase();
                    }
                    data++;
                }
            }
        }
        static UpdateCpuDisplay() {
            document.getElementById("cpuPC").innerHTML = String(_CPU.currentProgram.pc);
            let acc = _CPU.currentProgram.acc.toString(16).toUpperCase();
            document.getElementById("cpuACC").innerHTML = acc;
            document.getElementById("cpuXREG").innerHTML = String(_CPU.currentProgram.xReg);
            document.getElementById("cpuYREG").innerHTML = String(_CPU.currentProgram.yReg);
            document.getElementById("cpuZFlag").innerHTML = String(_CPU.currentProgram.zReg);
        }
        static UpdateDiskDisplay() {
            var diskTable = document.getElementById('diskT');
            var rows = diskTable.rows.length;
            for (var i = 0; i < rows; i++) {
                diskTable.deleteRow(0);
            }
            var row = 0;
            for (let track = 0; track < _Disk.tracks; track++) {
                for (let sector = 0; sector < _Disk.sectors; sector++) {
                    for (let block = 0; block < _Disk.blocks; block++) {
                        //make the id in order because I can't trust session storage
                        //its not in order for some reason so I must do it, uugh whatever
                        var id = track + ":" + sector + ":" + block;
                        var blockData = sessionStorage.getItem(id);
                        //blockData
                        var rowData = diskTable.insertRow(row);
                        row++;
                        var tsb = rowData.insertCell(0);
                        tsb.innerHTML = id;
                        tsb.style.backgroundColor = "darkOrange";
                        //var availB = rowData.insertCell(1);
                        //availB.innerHTML=;
                        //var next = rowData.insertCell(2);
                        //var nextVal=;
                        //next.innerHTML=nextVal;
                        var data = rowData.insertCell(1);
                        data.innerHTML = sessionStorage.getItem(id);
                    }
                }
            }
        }
    }
    TSOS.Control = Control;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=control.js.map