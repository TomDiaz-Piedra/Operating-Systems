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
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Loads user input. Gives Default Priority if non given");
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
            //SelectSchedule
            sc = new TSOS.ShellCommand(this.shellSchedule, "schedule", "- Select Scheduling Algorithm");
            this.commandList[this.commandList.length] = sc;
            //ShowSchedule
            sc = new TSOS.ShellCommand(this.shellShowSchedule, "getschedule", "- Show the current Scheduling Algorithm");
            this.commandList[this.commandList.length] = sc;
            //List
            sc = new TSOS.ShellCommand(this.shellList, "ls", "- List all User Files in Memory(No Swap Files)");
            this.commandList[this.commandList.length] = sc;
            //Copy
            sc = new TSOS.ShellCommand(this.shellCopy, "copy", "- Copies Data from one file into another. 1st Parameter is the file being copied, 2nd is the new files name");
            this.commandList[this.commandList.length] = sc;
            //Rename
            sc = new TSOS.ShellCommand(this.shellRename, "rename", "- Rename File, 1st parameter is old file name, 2nd is file's new name");
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
            var priority = parseInt(args, 10);
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
                if (Number.isInteger(priority)) {
                    pcb.priority = priority;
                }
                if (isNaN(priority) || priority == null) {
                    _StdOut.putText("Error: Priority given is Not a Number. Giving Process Default Priority");
                    _StdOut.advanceLine();
                    pcb.priority = defaultPriority;
                }
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
                    if (isFormatted) {
                        let pcb = new TSOS.processControlBlock();
                        pcb.segment = null;
                        pcb.init();
                        pcb.location = "Disk";
                        let filename = pcb.pid.toString();
                        filename = "*" + filename;
                        _krnDiskDriver.createFile(filename);
                        _krnDiskDriver.writeFile(filename, val);
                        residentqueue.enqueue(pcb);
                        residentlist.push(pcb);
                        TSOS.Control.addPcb(pcb);
                        _NextAvailablePID++;
                        if (Number.isInteger(priority)) {
                            pcb.priority = priority;
                        }
                        if (isNaN(priority) || priority == null) {
                            _StdOut.putText("Priority Not Given or Not a Number. Default Priority Assigned.");
                            _StdOut.advanceLine();
                            pcb.priority = defaultPriority;
                        }
                        _StdOut.putText("Valid: PID = " + pcb.pid + " Saved To Disk");
                    }
                    else {
                        _StdOut.putText("Error: Cannot Load Process - No Space In Memory - Disk Not Formatted");
                    }
                }
                else {
                    _StdOut.putText("InValid");
                }
            }
            //If after loading or attempting to load, a process; the scheduling algorithm is set to priority we will re-sort the resident queue
            if (currentSchedule == "priority") {
                _Scheduler.priority();
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
                    if (temp.location == "Disk") {
                        //dequeue the first program in resident queue and put it on the Disk
                        let prog = residentqueue.dequeue();
                        _CPU.currentProgram = prog;
                        //Now roll in roll out: Needed to put a program on the CPU because my Roll in/out only move the program that is on CPU(Most Recently Used)
                        _Swapper.rollOut();
                        _Swapper.rollIn(temp);
                    }
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
            if (currentSchedule == "fcfs" || currentSchedule == "priority") {
                _StdOut.putText("Cannot Change Quantum While Scheduling Algorithm is NOT Round Robin!");
                return;
            }
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
                _StdOut.putText("File " + args + " was created!");
            }
        }
        shellWrite(args) {
            if (args.length < 2 || args.length > 2 || isFormatted == false) {
                _StdOut.putText("Error: Invalid Number of Parameters! Remember a filename and data only. No Spaces Allowed!");
            }
            else {
                let data = args[1];
                data = data.substring(1, data.length - 1);
                _krnDiskDriver.writeFile(args[0], data); //args[1]
                _StdOut.putText("Write Successful!");
            }
        }
        shellRead(args) {
            if (args == null || isFormatted == false || args.length > 1) {
                _StdOut.putText("Error: Missing Parameters or Disk is Not Formatted!");
            }
            else {
                _StdOut.putText("Reading File " + args);
                _StdOut.advanceLine();
                let read = _krnDiskDriver.readFile(args);
                if (read == false) {
                    return;
                }
                else {
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
        }
        shellDelete(args) {
            if (args == null || isFormatted == false || args.length > 1) {
                _StdOut.putText("Error: Missing Parameters or Disk is Not Formatted!");
            }
            else {
                if (args[0] == "*") {
                    _StdOut.putText("Error: Cannot Delete Swap Files!");
                    return;
                }
                _krnDiskDriver.deleteFile(args);
                _StdOut.putText("Deleted File Successfully!");
            }
        }
        shellSchedule(args) {
            if (args == "rr" || args == "fcfs" || args == "priority") {
                currentSchedule = args;
                if (currentSchedule == "rr") {
                    _StdOut.putText("Scheduling Changed to Round Robin");
                    Quantum = 6;
                    //Reset Quantum to Default
                }
                else if (currentSchedule == "fcfs") {
                    //Keep it Round Robin, but with a Max Safe Integer as the Quantum
                    _StdOut.putText("Scheduling Changed to First Come First Serve");
                    _Scheduler.fcfs();
                }
                else if (currentSchedule == "priority") {
                    _StdOut.putText("Scheduling Changed to Non-Preemptive Priority");
                    _Scheduler.priority();
                    //Still Keep it Round Robin, but re order the readyqueue by priority and make the Quantum Max Safe Integer again
                    //Why do more work, when non-preemptive can be accomplished through a very large Quantum
                }
            }
            else {
                _StdOut.putText("Error: Invalid Scheduling Algorithm");
                _StdOut.advanceLine();
                _StdOut.putText("Valid Scheduling Algorithms: rr, fcfs, priority");
            }
        }
        shellShowSchedule() {
            if (currentSchedule == "rr") {
                _StdOut.putText("Current Scheduling Algorithm: Round Robin");
            }
            else if (currentSchedule == "fcfs") {
                _StdOut.putText("Current Scheduling Algorithm: First Come First Serve");
            }
            else if (currentSchedule == "priority") {
                _StdOut.putText("Current Scheduling Algorithm: Priority");
            }
        }
        //Show all non hidden files
        shellList() {
            let names = _krnDiskDriver.listFiles();
            if (names.length <= 0) {
                _StdOut.putText("Error: No Files on Disk");
            }
            else {
                _StdOut.putText("Files on Disk:");
                for (let i = 0; i < names.length; i++) {
                    _StdOut.putText(" " + names[i] + ",");
                }
            }
        }
        //Copy file info to new file: first arg is name of file you want to copy, second is the file name you want to create that is a copy
        shellCopy(args) {
            if (args.length > 2 || args.length < 2) {
                _StdOut.putText("Error: Missing or Too Many Parameters.");
            }
            else {
                let data = _krnDiskDriver.readFile(args[0]);
                //Concat all data into 1 string (in array chunks of 60 right now)
                let finalData = "";
                if (data == false) {
                }
                else {
                    for (let i = 0; i < data.length; i++) {
                        let newD = data[i].split("00").join("");
                        finalData = finalData.concat(_krnDiskDriver.hex_to_ascii(newD));
                    }
                    finalData = finalData.split(" ").join("");
                    finalData = finalData.split("00").join("");
                    let newFile = _krnDiskDriver.createFile(args[1]);
                    if (newFile) {
                        _krnDiskDriver.writeFile(args[1], finalData);
                        _StdOut.putText("Copied File " + args[0] + " To File " + args[1]);
                    }
                    else {
                    }
                }
            }
        }
        //Rename File: First arg is the original file name, second is the new name you want to change it to
        shellRename(args) {
            //Find file name:
            //Either make a function to just change the name by getting the tsb and rewriting it, or
            //just do that
            if (args > 2 || args < 2) {
                _StdOut.putText("Error: Invalid Number of Parameters");
            }
            else {
                _krnDiskDriver.renameFile(args[0], args[1]);
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