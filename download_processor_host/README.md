# Download Processor Host

This is the source code of the native executable for the Download Processor extensions for Firefox and Chrome. It process the matched downloads using another external application which can be specified in the extension options.

## Message format

Here you can find a short description of the message format used.

### Incomming messages

JSON Obejct: 
{
    "target": "<should be path to the executable>",
    "args": "<additional program arguments>",
    "file": "<downloaded file which was matched>"
}
    
This results in executing the "target args file" on the local system.

### Answer message

JSON Object:
{
    "error": true/false
    "response": "<some error description or the name of the target>"
}

The answer contains a flag showing if an error occured and some information as text.

