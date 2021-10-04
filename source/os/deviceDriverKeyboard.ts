/* ----------------------------------
   DeviceDriverKeyboard.ts

   The Kernel Keyboard Device Driver.
   ---------------------------------- */

module TSOS {

    // Extends DeviceDriver
    export class DeviceDriverKeyboard extends DeviceDriver {

        constructor() {
            // Override the base method pointers.

            // The code below cannot run because "this" can only be
            // accessed after calling super.
            // super(this.krnKbdDriverEntry, this.krnKbdDispatchKeyPress);
            // So instead...
            super();
            this.driverEntry = this.krnKbdDriverEntry;
            this.isr = this.krnKbdDispatchKeyPress;
        }

        public krnKbdDriverEntry() {
            // Initialization routine for this, the kernel-mode Keyboard Device Driver.
            this.status = "loaded";
            // More?
        }

        public krnKbdDispatchKeyPress(params) {
            // Parse the params.  TODO: Check that the params are valid and osTrapError if not.
            var keyCode = params[0];
            var isShifted = params[1];
            _Kernel.krnTrace("Key code:" + keyCode + " shifted:" + isShifted);
            var chr = "";
            // Check to see if we even want to deal with the key that was pressed.


            if ((keyCode >= 65) && (keyCode <= 90)) { // letter

                if (isShifted === true) {
                    chr = String.fromCharCode(keyCode); // Uppercase A-Z
                } else {
                    chr = String.fromCharCode(keyCode + 32); // Lowercase a-z
                }

                // TODO: Check for caps-lock and handle as shifted if so.
                _KernelInputQueue.enqueue(chr);
            } else if ( keyCode == 32 || keyCode == 13 || keyCode === 8 || keyCode == 9) { // enter, space, delete, and tab
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }

            else if ( keyCode == 38 || keyCode == 40) { // Arrow up and down
                chr = String.fromCharCode(keyCode);
                _KernelInputQueue.enqueue(chr);
            }

            else if (((keyCode >= 48) && (keyCode <= 57))) {
                if (isShifted) {
                    switch (keyCode) {
                        case 48:
                            chr = ")";
                            break;
                        case 49:
                            chr = "!";
                            break;
                        case 50:
                            chr = "@";
                            break;
                        case 51:
                            chr = "#";
                            break;
                        case 52:
                            chr = "$";
                            break;
                        case 53:
                            chr = "%";
                            break;
                        case 54:
                            chr = "^";
                            break;
                        case 55:
                            chr = '&&';
                            break;
                        case 56:
                            chr = "*";
                            break;
                        case 57:
                            chr = "((";
                            break;
                    }
                }
                else {
                    chr = String.fromCharCode(keyCode);
                }
                _KernelInputQueue.enqueue(chr);
        }
    }
}}
