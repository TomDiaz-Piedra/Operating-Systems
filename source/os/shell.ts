/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = ">";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc: ShellCommand;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            //load
            sc = new ShellCommand(this.shellLoad,
                "load",
                "- Loads user input.");
            this.commandList[this.commandList.length] = sc;

            //clearMem
            sc = new ShellCommand(this.shellClearMem,
                "clearmem",
                "- Kills all programs, then clears memory.");
            this.commandList[this.commandList.length] = sc;

            //killAll
            sc = new ShellCommand(this.shellKillAll,
                "killall",
                "- kill all programs.");
            this.commandList[this.commandList.length] = sc;

            //kill
            sc = new ShellCommand(this.shellKill,
                "kill",
                "- kills program.");
            this.commandList[this.commandList.length] = sc;

            //runall
            sc = new ShellCommand(this.shellRunAll,
                "runall",
                "- runs all programs.");
            this.commandList[this.commandList.length] = sc;

            //run
            sc = new ShellCommand(this.shellRun,
                "run",
                "- runs user program.");
            this.commandList[this.commandList.length] = sc;

            //Quantum
            sc = new ShellCommand(this.shellQuantum,
                "quantum",
                "- Change round robin quantum.");
            this.commandList[this.commandList.length] = sc;

            //status
            sc = new ShellCommand(this.shellStatus,
                "status",
                "- Changes status message to user input");
            this.commandList[this.commandList.length] = sc;

            //whereami
            sc = new ShellCommand(this.shellWhereami,
                "whereami",
                "- Displays Location.");
            this.commandList[this.commandList.length] = sc;

            //date
            sc = new ShellCommand(this.shellDate,
                "date",
                "- Displays the Current Date.");
            this.commandList[this.commandList.length] = sc;

            //cube
            sc = new ShellCommand(this.shellCube,
                "cube",
                "- Summons Cube");
            this.commandList[this.commandList.length] = sc;

            //cube
            sc = new ShellCommand(this.shellBSOD,
                "bsod",
                "- Displays Blue Screen of Death");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // ps  - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
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
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);  // Note that args is always supplied, though it might be empty.
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {        // Check for apologies.
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
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

        public parseInput(buffer: string): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            //buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            cmd = cmd.toLowerCase();

            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
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
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Unbelievable. You, [subject name here],");
                _StdOut.advanceLine();
                _StdOut.putText("must be the pride of [subject hometown here].");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("I think we can put our differences behind us.");
              _StdOut.advanceLine();
              _StdOut.putText("For science . . . You monster.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        // Although args is unused in some of these functions, it is always provided in the 
        // actual parameter list when this function is called, so I feel like we need it.

        public shellVer(args: string[]) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        public shellStatus(args: string[]) {
            //var str = args.toString();
            var str=args.join(" ");
            document.getElementById("status").innerHTML=str;
        }

        public shellDate(args: string[]) {
            let dateTime = new Date();
            _StdOut.putText("Date: " + dateTime);
        }

        public shellWhereami(args: string[]) {
            _StdOut.putText("Location: Aperture Science Laboratory");

        }

        public shellLoad(args) {
            var load: any;
            var val: string;
            var validSpace:boolean=true;
            load = document.getElementById("taProgramInput");

            val = load.value;
            val = val.toString();
            val.split("\n").join("");
            val = val.split(" ").join("");
            let isEven:boolean= val.length%2==0;
            const re = /^[0-9a-fA-F]+$/;
            let programLength = val.length;
            validSpace = _MemoryManager.checkValid(programLength);


            if(re.test(val) && validSpace) {
//change to get correct segment
                let seg=_MemoryManager.getValid();
                seg.isEmpty=false;
                let adr = seg.Start;
                let test:number = val.length;
                let start=0;
                let end=2;
                while (start<test) {
                    let byte = val.substring(start,end);
                    _MemoryAccessor.setMAR(adr);

                    _MemoryAccessor.setMDR(parseInt(byte,16));
                    _MemoryAccessor.write();
                    start=start+2;
                    end=end+2;
                    adr++;
                }
                TSOS.Control.UpdateMemDisplay();

                let pcb = new TSOS.processControlBlock();
                //pcb.pc=seg.Start;
                pcb.segment=seg;
                residentqueue.enqueue(pcb);
                residentlist.push(pcb);
                TSOS.Control.addPcb(pcb);
                //_StdOut.putText("Valid: PID = "+pcb.pid);
                _StdOut.putText("Valid: PID = "+pcb.pid);

                _NextAvailablePID++;
            } else {
                if(!validSpace){
                    _StdOut.putText("No Space Left in Memory!!!");
                }
                else {
                    _StdOut.putText("InValid");
                }
            }

            re.lastIndex=0;


        }
        public shellRun(args){
            //_StdOut.putText(_Memory.mem[4].toString());
            //_StdOut.putText(_Memory.mem[5].toString());
            var found=false;

            for(let i=0;i<residentqueue.getSize();i++) {
                let temp = residentqueue.dequeue();
                if (temp.pid == args) {

                    found = true;
                    temp.state = "ready";
                    TSOS.Control.updatePCB(temp);
                    readyqueue.enqueue(temp);
                    _CPU.startCPU();

                } else {
                    residentqueue.enqueue(temp);
                }
            }
                if(found){
                    _StdOut.putText("Running Process With PID: "+args);
                }
                else{
                    if(!found) {
                        _StdOut.putText("No Process Found With PID: " + args);
                    }
                    else if(residentqueue.isEmpty()){
                        _StdOut.putText("No Processes Loaded! ");
                    }
                    }




        }
        public shellRunAll(args){
            if(!residentqueue.isEmpty()) {
                while (!residentqueue.isEmpty()) {
                    let program = residentqueue.dequeue();
                    let x = _ProcessControlBlock.getPCB(program.pid);
                    x.state = "ready";
                    TSOS.Control.updatePCB(x);
                    readyqueue.enqueue(x);
                }
                _CPU.startCPU();
            }
            else{
                _StdOut.putText(" No Processes Loaded In Memory!!!");
            }
        }
        public shellKill(args){
            let pcb = _ProcessControlBlock.getPCB(args);
            if(pcb.state=="running") {
                _CPU.kill();
            }
            else if(pcb.state=='ready'){
                _CPU.killNotRunning(args);
            }

           // _StdOut.advanceLine();

        }
        public shellKillAll(args){
            //_CPU.killAll();
            _MemoryAccessor.clearMem();

        }
        public shellClearMem(args){
            _MemoryAccessor.clearMem();
        }
        public shellQuantum(args){
            if(args<=0 || args instanceof String){
                _StdOut.putText("Invalid Quantum!");

            }
            else {
                Quantum = args;
            }
        }

        public shellCube(args: string[]) {
            let cube = document.getElementById('cube') as HTMLImageElement;
            cube.src = "distrib/images/cube.png";
        }

        public shellBSOD(args: string[]) {
            TSOS.Control.hostBtnHaltOS_click(this);
            let bsod = document.getElementById('popup') as HTMLImageElement;
            bsod.style.display="block";
        }

        public shellHelp(args: string[]) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args: string[]) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _CPU.isExecuting=false;
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }

        public shellCls(args: string[]) {         
            _StdOut.clearScreen();     
            _StdOut.resetXY();
        }

        public shellMan(args: string[]) {
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
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args: string[]) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, doofus.");
                        } else {
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
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args: string[]) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args: string[]) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

    }
}
