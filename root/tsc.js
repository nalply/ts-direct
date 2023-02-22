const el = document.createElement('script')
el.src = "typescript.js"
el.onload = transpileAll
document.head.appendChild(el)

const compilerOptions = {
  module: "es2022",
  target: "es2022",
  strict: true, 
}

async function transpileAll() {
  for (const el of document.querySelectorAll("script[type=ts]")) {
    const response = await fetch(el.src)
    const src = await response.text()
    const script = document.createElement('script')
    script.innerHTML = ts.transpile(src, compilerOptions)
    document.head.appendChild(script)
  }
}

