// Uso:  1) Copie el valor de la cookie "token" desde DevTools (Ctrl+C)
//       2) npm run token
// Lee el portapapeles (Windows), valida el token y lo guarda en cypress.env.json.
// Nunca imprime el token.
const fs = require('fs');
const { execSync } = require('child_process');

function leerPortapapeles() {
  const cmds = {
    win32: 'powershell -NoProfile -command "Get-Clipboard"',
    darwin: 'pbpaste',
    linux: 'xclip -selection clipboard -o',
  };
  return execSync(cmds[process.platform] || cmds.linux, { encoding: 'utf8' });
}

function decodificar(token) {
  const partes = token.split('.');
  if (partes.length !== 3 || !token.startsWith('eyJ')) return null;
  try {
    const b64 = partes[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
  } catch (e) {
    return null;
  }
}

let token = '';
try {
  token = leerPortapapeles().trim().replace(/^"|"$/g, '');
} catch (e) {
  console.error('No pude leer el portapapeles.');
  process.exit(1);
}

const datos = decodificar(token);
if (!datos || !datos.exp) {
  console.error('El portapapeles no contiene un token valido (debe empezar con eyJ y tener 3 partes).');
  console.error('Copie de nuevo el valor de la cookie "token" y repita.');
  process.exit(1);
}

const minutos = Math.floor((datos.exp * 1000 - Date.now()) / 60000);
if (minutos <= 0) {
  console.error(`Ese token ya esta vencido (hace ${Math.abs(minutos)} min). Inicie sesion de nuevo y copie uno nuevo.`);
  process.exit(1);
}

const ruta = 'cypress.env.json';
const env = fs.existsSync(ruta) ? JSON.parse(fs.readFileSync(ruta, 'utf8')) : {};
env.VICE_TOKEN = token;
fs.writeFileSync(ruta, JSON.stringify(env, null, 2));

const vence = new Date(datos.exp * 1000).toLocaleTimeString('es-CO');
console.log(`VICE_TOKEN guardado (largo ${token.length}). Rol: ${datos.rol || '?'}. Vence a las ${vence} (quedan ${minutos} min).`);