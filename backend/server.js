const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs-extra");
const path = require("path");
const { exec, spawn } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

const app = express();
const PORT = 3001;

// Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);
app.use(bodyParser.json({ limit: "10mb" }));

// Diretório temporário
const TEMP_DIR = path.join(__dirname, "temp");
fs.ensureDirSync(TEMP_DIR);

// Limpar temp a cada 1 hora
setInterval(() => {
  fs.emptyDirSync(TEMP_DIR);
}, 3600000);

// ========== EXECUTOR JAVASCRIPT (local, sem backend) ==========
function executeJavaScript(code) {
  try {
    let output = [];
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      output.push(
        args
          .map((arg) =>
            typeof arg === "object"
              ? JSON.stringify(arg, null, 2)
              : String(arg),
          )
          .join(" "),
      );
    };

    console.error = (...args) => {
      output.push("Erro: " + args.map(String).join(" "));
    };

    const result = eval(code);

    console.log = originalLog;
    console.error = originalError;

    if (result !== undefined) {
      output.push(`→ Return: ${JSON.stringify(result, null, 2)}`);
    }

    return {
      success: true,
      output: output.join("\n"),
      type: "text",
    };
  } catch (error) {
    return {
      success: false,
      output: `Erro JavaScript: ${error.message}`,
      type: "error",
    };
  }
}

// ========== EXECUTOR PYTHON ==========
async function executePython(code, executionId) {
  const tempDir = path.join(TEMP_DIR, executionId);
  fs.ensureDirSync(tempDir);

  const filePath = path.join(tempDir, "script.py");
  fs.writeFileSync(filePath, code, "utf-8");

  try {
    // Tentar com python3 primeiro, depois python
    let stdout, stderr;

    try {
      const result = await execPromise(`python3 ${filePath}`, {
        timeout: 5000,
        maxBuffer: 1024 * 1024,
      });
      stdout = result.stdout;
      stderr = result.stderr;
    } catch (err) {
      // Se python3 falhar, tentar python
      const result = await execPromise(`python ${filePath}`, {
        timeout: 5000,
        maxBuffer: 1024 * 1024,
      });
      stdout = result.stdout;
      stderr = result.stderr;
    }

    return {
      success: true,
      output: stdout || stderr || "✅ Executado com sucesso!",
      type: stderr ? "error" : "text",
    };
  } catch (error) {
    return {
      success: false,
      output: `Erro Python: ${error.message}. Verifique se o Python está instalado.`,
      type: "error",
    };
  } finally {
    fs.removeSync(tempDir);
  }
}

// ========== EXECUTOR JAVA ==========
async function executeJava(code, executionId) {
  const tempDir = path.join(TEMP_DIR, executionId);
  fs.ensureDirSync(tempDir);

  // Extrair nome da classe
  const classNameMatch = code.match(/public\s+class\s+(\w+)/);
  const className = classNameMatch ? classNameMatch[1] : "Main";

  // Se não encontrar classe pública, adicionar wrapper
  let finalCode = code;
  if (!classNameMatch) {
    finalCode = `public class Main {\n    public static void main(String[] args) {\n${code
      .split("\n")
      .map((line) => "        " + line)
      .join("\n")}\n    }\n}`;
  }

  const filePath = path.join(tempDir, `${className}.java`);
  fs.writeFileSync(filePath, finalCode, "utf-8");

  try {
    // Compilar
    await execPromise(`javac ${filePath}`, { timeout: 10000 });

    // Executar
    const { stdout, stderr } = await execPromise(
      `java -cp ${tempDir} ${className}`,
      { timeout: 5000 },
    );

    return {
      success: true,
      output: stdout || stderr || "✅ Executado com sucesso!",
      type: stderr ? "error" : "text",
    };
  } catch (error) {
    return {
      success: false,
      output: `Erro Java: ${error.message}. Verifique se o Java JDK está instalado.`,
      type: "error",
    };
  } finally {
    fs.removeSync(tempDir);
  }
}

// ========== EXECUTOR C++ ==========
async function executeCPP(code, executionId) {
  const tempDir = path.join(TEMP_DIR, executionId);
  fs.ensureDirSync(tempDir);

  const filePath = path.join(tempDir, "main.cpp");
  const outputPath = path.join(tempDir, "main.exe");

  fs.writeFileSync(filePath, code, "utf-8");

  try {
    // Compilar
    await execPromise(`g++ ${filePath} -o ${outputPath}`, { timeout: 10000 });

    // Executar
    const { stdout, stderr } = await execPromise(outputPath, { timeout: 5000 });

    return {
      success: true,
      output: stdout || stderr || "✅ Executado com sucesso!",
      type: stderr ? "error" : "text",
    };
  } catch (error) {
    return {
      success: false,
      output: `Erro C++: ${error.message}. Verifique se o g++ está instalado.`,
      type: "error",
    };
  } finally {
    fs.removeSync(tempDir);
  }
}

// ========== PREVIEW HTML ==========
function executeHTML(code) {
  return {
    success: true,
    output: code,
    type: "html",
  };
}

// ========== ROTAS ==========
app.get("/api/health", (req, res) => {
  res.json({
    status: "running",
    timestamp: new Date().toISOString(),
    languages: ["javascript", "python", "java", "cpp", "html"],
  });
});

app.post("/api/execute", async (req, res) => {
  const { code, language } = req.body;
  const executionId = uuidv4();

  console.log(`📥 Executando ${language}...`);

  if (!code) {
    return res.json({
      success: false,
      output: "Código vazio",
      type: "error",
    });
  }

  try {
    let result;

    switch (language) {
      case "javascript":
        result = executeJavaScript(code);
        break;
      case "python":
        result = await executePython(code, executionId);
        break;
      case "java":
        result = await executeJava(code, executionId);
        break;
      case "cpp":
        result = await executeCPP(code, executionId);
        break;
      case "html":
        result = executeHTML(code);
        break;
      default:
        result = {
          success: false,
          output: `Linguagem não suportada: ${language}`,
          type: "error",
        };
    }

    console.log(`✅ ${language} executado`);
    res.json(result);
  } catch (error) {
    console.error("❌ Erro:", error);
    res.json({
      success: false,
      output: `Erro interno: ${error.message}`,
      type: "error",
    });
  }
});

app.listen(PORT, () => {
  console.log("\n🚀 BACKEND RODANDO!");
  console.log(`📡 Porta: ${PORT}`);
  console.log("📝 Linguagens: JavaScript, Python, Java, C++, HTML");
  console.log("✅ Pronto para receber requisições\n");
});
