/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    class Shell {
        constructor() {
            // Properties
            this.promptStr = ">";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        init() {
            var sc;
            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;
            //load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Loads user input.");
            this.commandList[this.commandList.length] = sc;
            //clearMem
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "- Kills all programs, then clears memory.");
            this.commandList[this.commandList.length] = sc;
            //killAll
            sc = new TSOS.ShellCommand(this.shellKillAll, "killall", "- kill all programs.");
            this.commandList[this.commandList.length] = sc;
            //kill
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "- kills program.");
            this.commandList[this.commandList.length] = sc;
            //runall
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "- runs all programs.");
            this.commandList[this.commandList.length] = sc;
            //run
            sc = new TSOS.ShellCommand(this.shellRun, "run", "- runs user program.");
            this.commandList[this.commandList.length] = sc;
            //Quantum
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "- Change round robin quantum.");
            this.commandList[this.commandList.length] = sc;
            //Format
            sc = new TSOS.ShellCommand(this.shellFormat, "format", "- Format the Disk.");
            this.commandList[this.commandList.length] = sc;
            //Create
            sc = new TSOS.ShellCommand(this.shellCreate, "create", "- Create a file on the disk.");
            this.commandList[this.commandList.length] = sc;
            //Write
            sc = new TSOS.ShellCommand(this.shellWrite, "write", "- Write into File. Must be within Quotation Marks");
            this.commandList[this.commandList.length] = sc;
            //Read
            sc = new TSOS.ShellCommand(this.shellRead, "read", "- Read File Data Given its name");
            this.commandList[this.commandList.length] = sc;
            //Delete
            sc = new TSOS.ShellCommand(this.shellDelete, "delete", "- Delete a file with given name");
            this.commandList[this.commandList.length] = sc;
            //Process State
            sc = new TSOS.ShellCommand(this.shellPS, "ps", "- Display all Process and their states.");
            this.commandList[this.commandList.length] = sc;
            //status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "- Changes status message to user input");
            this.commandList[this.commandList.length] = sc;
            //whereami
            sc = new TSOS.ShellCommand(this.shellWhereami, "whereami", "- Displays Location.");
            this.commandList[this.commandList.length] = sc;
            //date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the Current Date.");
            this.commandList[this.commandList.length] = sc;
            //cube
            sc = new TSOS.ShellCommand(this.shellCube, "cube", "- Summons Cube");
            this.commandList[this.commandList.length] = sc;
            //cube
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", "- Displays Blue Screen of Death");
            this.commandList[this.commandList.length] = sc;
            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;
            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;
            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;
            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;
            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;
            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;
            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            // Display the initial prompt.
            this.putPrompt();
        }
        putPrompt() {
            _StdOut.putText(this.promptStr);
        }
        handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match. 
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                }
                else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args); // Note that args is always supplied, though it might be empty.
            }
            else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) { // Check for curses.
                    this.execute(this.shellCurse);
                }
                else if (this.apologies.indexOf("[" + cmd + "]") >= 0) { // Check for apologies.
                    this.execute(this.shellApology);
                }
                else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }
        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        execute(fn, args) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }
        parseInput(buffer) {
            var retVal = new TSOS.UserCommand();
            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);
            // 2. Lower-case it.
            //buffer = buffer.toLowerCase();
            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");
            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);
            cmd = cmd.toLowerCase();
            // 4.2 Record it in the return value.
            retVal.command = cmd;
            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }
        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            }
            else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }
        shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }
        shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText("I think we can put our differences behind us.");
                _StdOut.advanceLine();
                _StdOut.putText("For science . . . You monster.");
                _SarcasticMode = false;
            }
            else {
                _StdOut.putText("For what?");
            }
        }
        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.
        shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }
        shellStatus(args) {
            //var str = args.toString();
            var str = args.join(" ");
            document.getElementById("status").innerHTML = str;
        }
        shellDate(args) {
            let dateTime = new Date();
            _StdOut.putText("Date: " + dateTime);
        }
        shellWhereami(args) {
            _StdOut.putText("Location: Aperture Science Laboratory");
        }
        shellLoad(args) {
            var load;
            var val;
            var validSpace = true;
            load = document.getElementById("taProgramInput");
            val = load.value;
            val = val.toString();
            val.split("\n").join("");
            val = val.split(" ").join("");
            let isEven = val.length % 2 == 0;
            const re = /^[0-9a-fA-F]+$/;
            let programLength = val.length;
            validSpace = _MemoryManager.checkValid(programLength);
            if (re.test(val) && validSpace) {
                //change to get correct segment
                let seg = _MemoryManager.getValid();
                seg.isEmpty = false;
                //let adr = seg.Start;
                let adr = 0;
                let test = val.length;
                let start = 0;
                let end = 2;
                //Creates a new PCB and assigns its segment to the first available
                //The base, limit, and offset registers are then initialized
                let pcb = new TSOS.processControlBlock();
                pcb.segment = seg;
                pcb.init();
                pcb.location = "Memory";
                while (start < test) {
                    let byte = val.substring(start, end);
                    _MemoryAccessor.setMAR(adr + pcb.segment.offset);
                    _MemoryAccessor.setMDR(parseInt(byte, 16));
                    _MemoryAccessor.write();
                    start = start + 2;
                    end = end + 2;
                    adr++;
                }
                TSOS.Control.UpdateMemDisplay();
                //Enqueue the new PCB onto the residentlist and residentqueue
                //The list is a record of all PCB's past and present
                //The queue are the current programs that are loaded into memory, but are not running
                residentqueue.enqueue(pcb);
                residentlist.push(pcb);
                TSOS.Control.addPcb(pcb);
                _StdOut.putText("Valid: PID = " + pcb.pid);
                _NextAvailablePID++;
            }
            else {
                if (!validSpace) {
                    //If no space:
                    //Load program into Disk, do not give it a segment
                    //When we swap a process from memory to disk:
                    // 1. Load it into memory
                    // 2. Free up the memory segment by Clearing it completely(Only after saving it onto the disk!)
                    //When we put the process in the Disk onto the main memory:
                    // IF THE PROCESS WAS NEVER LOADED ONTO MEMORY
                    // 1. Give the process the first available segment
                    // 2. Load the process into said segment(Using a swapper method that can load with params)
                    // IF THE PROCESS WAS PREVIOUSLY LOADED
                    // 1. WIPE ITS OLD SEGMENT(if not already done)
                    // 2. Save Process whose quantum ran out onto disk
                    // 3. Clear segment, and assign it to the process going back on memory
                    // 4. load the process into the segment in memory
                    _StdOut.putText("No Space Left in Memory!!!");
                }
                else {
                    _StdOut.putText("InValid");
                }
            }
            re.lastIndex = 0;
        }
        shellRun(args) {
            var found = false;
            for (let i = 0; i < residentqueue.getSize(); i++) {
                let temp = residentqueue.dequeue();
                if (temp.pid == args) {
                    found = true;
                    temp.state = "ready";
                    TSOS.Control.updatePCB(temp);
                    readyqueue.enqueue(temp);
                    _CPU.startCPU();
                }
                else {
                    residentqueue.enqueue(temp);
                }
            }
            if (found) {
                _StdOut.putText("Running Process With PID: " + args);
            }
            else {
                if (!found) {
                    _StdOut.putText("No Process Found With PID: " + args);
                }
                else if (residentqueue.isEmpty()) {
                    _StdOut.putText("No Processes Loaded! ");
                }
            }
        }
        shellRunAll(args) {
            if (!residentqueue.isEmpty()) {
                while (!residentqueue.isEmpty()) {
                    let program = residentqueue.dequeue();
                    let x = _ProcessControlBlock.getPCB(program.pid);
                    x.state = "ready";
                    TSOS.Control.updatePCB(x);
                    readyqueue.enqueue(x);
                }
                _CPU.startCPU();
            }
            else {
                _StdOut.putText(" No Processes Loaded In Memory!!!");
            }
        }
        shellKill(args) {
            let pcb = _ProcessControlBlock.getPCB(args);
            if (pcb.state == "running") {
                _CPU.kill();
            }
            else if (pcb.state == 'ready') {
                _CPU.killNotRunning(args);
            }
            // _StdOut.advanceLine();
        }
        shellPS() {
            let size = residentlist.length;
            if (size == 0) {
                _StdOut.putText("No Processes!");
            }
            else if (size > 0) {
                for (let i = 0; i < residentlist.length; i++) {
                    _StdOut.putText("PID: " + residentlist[i].pid + " State: " + residentlist[i].state);
                    _StdOut.advanceLine();
                    _StdOut.putText("----------------------------------");
                    _StdOut.advanceLine();
                }
            }
        }
        shellKillAll(args) {
            _MemoryAccessor.clearMem();
        }
        shellClearMem(args) {
            _MemoryAccessor.clearMem();
        }
        shellQuantum(args) {
            if (args <= 0 || isNaN(args)) {
                _StdOut.putText("Invalid Quantum!");
            }
            else {
                Quantum = args;
            }
        }
        shellFormat(args) {
            if (!isFormatted) {
                _krnDiskDriver.format();
                _StdOut.putText("Format Completed Successfully");
                isFormatted = true;
                TSOS.Control.UpdateDiskDisplay();
            }
            else {
                _StdOut.putText("Error: Already Formatted!");
            }
        }
        shellCreate(args) {
            if (!isFormatted) {
                _StdOut.putText("Error: Disk Must be Formatted!");
            }
            else if (args == "") {
                _StdOut.putText("Create Requires a File Name! Try Again!");
            }
            else if (isFormatted && args != "") {
                _krnDiskDriver.createFile(args);
            }
        }
        shellWrite(args) {
            if (args.length < 2 || args.length > 2 || isFormatted == false) {
                _StdOut.putText("Error: Too Many Parameters! Remember a filename and data only. No Spaces Allowed!");
            }
            else {
                let data = args[1];
                //_StdOut.putText(data);
                data = data.substring(1, data.length - 1);
                // _StdOut.putText(data);
                _krnDiskDriver.writeFile(args[0], args[1]);
            }
        }
        shellRead(args) {
            if (args == null || isFormatted == false || args.length > 1) {
                _StdOut.putText("Error: Missing Parameters or Disk is Not Formatted!");
            }
            else {
                _StdOut.putText("Reading File " + args);
                let read = _krnDiskDriver.readFile(args);
                let ans = "";
                for (let i = 0; i < read.length; i++) {
                    let str = read[i];
                    str = str.split("00");
                    let temp = _krnDiskDriver.hex_to_ascii(str);
                    ans = ans.concat(temp);
                }
                _StdOut.putText(ans);
            }
        }
        shellDelete(args) {
            if (args == null || isFormatted == false || args.length > 1) {
                _StdOut.putText("Error: Missing Parameters or Disk is Not Formatted!");
            }
            else {
                _krnDiskDriver.deleteFile(args);
            }
        }
        shellCube(args) {
            let cube = document.getElementById('cube');
            cube.src = "distrib/images/cube.png";
        }
        shellBSOD(args) {
            TSOS.Control.hostBtnHaltOS_click(this);
            let bsod = document.getElementById('popup');
            bsod.style.display = "block";
        }
        shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }
        shellShutdown(args) {
            _StdOut.putText("Shutting down...");
            // Call Kernel shutdown routine.
            _CPU.isExecuting = false;
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }
        shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }
        shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    case "ver":
                        _StdOut.putText("Ver displays the current OS version.");
                        break;
                    case "whereami":
                        _StdOut.putText("Whereami displays your current Location.");
                        break;
                    case "date":
                        _StdOut.putText("Date displays current Date and Time.");
                        break;
                    case "cube":
                        _StdOut.putText("Cube summons a test cube out of the bottom blue portal");
                        break;
                    case "shutdown":
                        _StdOut.putText("Shuts down the virtual OS but leaves the underlying host..");
                        break;
                    case "cls":
                        _StdOut.putText("Cls clears the screen and resets cursor position.");
                        break;
                    case "trace":
                        _StdOut.putText("trace turns on/off OS tracing");
                        break;
                    case "rot13":
                        _StdOut.putText("rot13 performs rot13 obfuscation on string given");
                        break;
                    case "prompt":
                        _StdOut.putText("Prompt sets the prompt to User input");
                        break;
                    case "man":
                        _StdOut.putText("Man gives more information on command given, if it exists.");
                        break;
                    case "load":
                        _StdOut.putText("Load, will load User Program, Only hex-code is valid.");
                        break;
                    case "status":
                        _StdOut.putText("Status changed the user's status message.");
                        break;
                    case "bsod":
                        _StdOut.putText("Bsod will crash the Operating System and display an error message");
                        break;
                    // TODO: Make descriptive MANual page entries for the the rest of the shell commands here.
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            }
            else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }
        shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        }
                        else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }
                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            }
            else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }
        shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            }
            else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }
        shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            }
            else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }
    }
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
//# sourceMappingURL=shell.js.map