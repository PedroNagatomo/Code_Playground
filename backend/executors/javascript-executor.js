const {v4: uuidv4} = require('uuid');
const fs = require('fs-extra');
const path = require('path');
const {VM} = require('vm2');
const { error } = require('console');

class JavaScriptExecutor{
    static async execute(code, executionId){
        return new Promise((resolve, reject) => {
            try{
                let output = [];
                const console = {
                    log: (...args) => {
                        output.push(args.map(arg => 
                            typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)    
                        ).join(' '));
                    },
                    error: (...args) => {
                        output.push('Error: ' + args.join(' '));
                    },
                    warn: (...args) => {
                        output.push('Warning: ' + args.join(' '));
                    },
                    info: (...args) => {
                        output.push('Info: ' + args.join(' '));
                    }
                };

                const vm = new VM({
                    timeout: 5000,
                    sandbox: {console},
                    eval: false,
                    wasm: false
                });

                const result = vm.run(code);

                if(result !== undefined){
                    output.push('Return: ' + JSON.stringify(result, null, 2));
                }

                resolve({
                    output: output.join('\n'),
                    type: 'text'
                });
            } catch (error){
                resolve({
                    output: `Erro: ${error.message}`,
                    error: error.message,
                    type: 'error'
                })
            }
        });
    }

    static async executeWithNode(code, executionId){
        const tempDir = path.join(__dirname, '../temp', executionId);
        fs.ensureDirSync(tempDir);

        const filePath = path.join(tempDir, 'index.js');
        fs.writeFileSync(filePath, code);

        try{
            const {exec} = require('child_process');
            const util = require('util');
            const execPromise = util.promisify(exec);

            const {stdout, stderr} = await execPromise(`node ${filePath}`, {
                timeout: 5000
            });

            return {
                output: stdout || stderr,
                type: stderr ? 'error' : 'text'
            };
        } catch (error){
            return {
                output: error.message,
                error: error.message,
                type: 'error'
            };
        }
    }
}

module.exports = JavaScriptExecutor;