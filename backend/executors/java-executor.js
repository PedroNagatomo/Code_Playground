const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

class JavaExecutor {
    static async execute(code, executionId) {
        const tempDir = path.join(__dirname, '../temp', executionId);
        fs.ensureDirSync(tempDir);
        
        // Extrair nome da classe do código
        const className = this.extractClassName(code) || 'Main';
        const filePath = path.join(tempDir, `${className}.java`);
        
        fs.writeFileSync(filePath, code);
        
        try {
            // Compilar
            await execPromise(`javac ${filePath}`, { timeout: 10000 });
            
            // Executar
            const { stdout, stderr } = await execPromise(
                `java -cp ${tempDir} ${className}`,
                { timeout: 5000 }
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

    static extractClassName(code) {
        const match = code.match(/public\s+class\s+(\w+)/);
        return match ? match[1] : null;
    }
}

module.exports = JavaExecutor;