/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */

module TSOS {

    export class Console {

        constructor(public currentFont = _DefaultFontFamily,
                    public currentFontSize = _DefaultFontSize,
                    public currentXPosition = 0,
                    public currentYPosition = _DefaultFontSize,
                    public commandHist = [],
                    public commandIndex = 0,
                    public buffer = "") {
        }

        public init(): void {
            this.clearScreen();
            this.resetXY();
        }

        public clearScreen(): void {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        }

        public resetXY(): void {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
        }

        public handleInput(): void {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    _OsShell.handleInput(this.buffer);

                    //Add input to history for Arrow Key Functionality
                    //Can't recall previous commands without recording them somewhere
                    //Add new Index
                    this.commandHist.push(this.buffer);
                    this.commandIndex=this.commandHist.length;

                    // ... and reset our buffer.
                    this.buffer = "";
                //Backspace
                }else if(chr===String.fromCharCode(8)){
                        //"Deletes" the last character by covering it up using clearRect
                        //Grabs the area and place the previous character was and covers it up thereby deleting it
                        var deleteTxt = this.buffer.substring(this.buffer.length - 1, this.buffer.length);
                        this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                        var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, deleteTxt);
                        this.currentXPosition = this.currentXPosition - offset;
                        var height = -1 * (_DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize)
                            + _FontHeightMargin);
                        _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition + _FontHeightMargin, offset, height);

                    }
                else if(chr===String.fromCharCode(38)){ //Arrow Up
                    this.ArrowKey("up");
                }
                else if(chr===String.fromCharCode(40)){ //Arrow Down
                    this.ArrowKey("down");
                }


                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        }

        public putText(text): void {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                this.currentXPosition = this.currentXPosition + offset;
            }
         }

         //Process Arrow Key Input
        public ArrowKey(code){
            if(this.commandHist.length > 0){
                let tempBuffer = this.buffer;
                //Clears the line before going through command history
                for(var i =0;i<tempBuffer.length;i++){
                    //If it looks familiar it is, this is the delete key functionality
                    var deleteTxt = this.buffer.substring(this.buffer.length - 1, this.buffer.length);
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                    var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, deleteTxt);
                    this.currentXPosition = this.currentXPosition - offset;
                    var height = -1 * (_DefaultFontSize + _DrawingContext.fontDescent(this.currentFont, this.currentFontSize)
                        + _FontHeightMargin);
                    _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition + _FontHeightMargin, offset, height);
                }
                if(code==="up"){
                    //check if index is greater than 0
                    if(this.commandIndex>0){
                        //Set buffer to the last buffer and increment index
                        this.buffer=this.commandHist[--this.commandIndex];

                    }
                }
                else if(code==="down"){
                    //check if there is something there
                    if(this.commandIndex<this.commandHist.length-1){
                        //set buffer to previous one
                        this.buffer=this.commandHist[++this.commandIndex];
                    }
                }
                //Put on canvas
                _StdOut.putText(this.buffer);
            }

        }

        public advanceLine(): void {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */

            this.currentYPosition += _DefaultFontSize + 
                                     _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                                     _FontHeightMargin;
            //Scrolling, done properly, not just an HTML built in Scroll-bar anymore
            //Checks if the text is at the bottom of the canvas
            if (this.currentYPosition > _Canvas.height) {
                //Record the current screen
                var img = _DrawingContext.getImageData(0, 20, _Canvas.width, _Canvas.height);
                //Put the screen back
                _DrawingContext.putImageData(img, 0, 0);
                //Set ourselves back on the last line of the canvas
                this.currentYPosition = 495;
            }
        };

        }
    }

