const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class PythonExecutor {
    static async execute(code, executionId) {
        const tempDir = path.join(__dirname, '../temp', executionId);
        fs.ensureDirSync(tempDir);
        
        const filePath = path.join(tempDir, 'script.py');
        fs.writeFileSync(filePath, code);
        
        try {
            const { stdout, stderr } = await execPromise(`python3 ${filePath}`, {
                timeout: 5000,
                maxBuffer: 1024 * 1024
            });
            
            return {
                output: stdout || stderr,
                type: stderr ? 'error' : 'text'
            };
            
        } catch (error) {
            return {
                output: error.message,
                error: error.message,
                type: 'error'
            };
        }
    }

    static async executeWithDocker(code, executionId) {
        const tempDir = path.join(__dirname, '../temp', executionId);
        fs.ensureDirSync(tempDir);
        
        const filePath = path.join(tempDir, 'script.py');
        fs.writeFileSync(filePath, code);
        
        try {
            const { stdout, stderr } = await execPromise(
                `docker run --rm -v ${tempDir}:/code python:3.10-slim python /code/script.py`,
                { timeout: 10000 }
            );
            
            return {
                output: stdout || stderr,
                type: stderr ? 'error' : 'text'
            };
            
        } catch (error) {
            return {
                output: error.message,
                error: error.message,
                type: 'error'
            };
        }
    }
}

module.exports = PythonExecutor;