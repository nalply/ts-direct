class Assert extends Error {
  override toString() {
    return this.message
  }

  static eq(left: any, right: any, ...msg: any): Assert | undefined {
    left = JSON.stringify(left)
    right = JSON.stringify(right)
    if (left === right) return

    msg = msg.length ? ", " + msg.join(" ") : ""
    throw new Assert(`not eq: ${left} ~ ${right}${msg}`)  
  }
  
  static truthy(truthy: any, ...msg: any): Assert | undefined {
    if (truthy) return

    truthy = JSON.stringify(truthy)
    msg = msg.length ? ", " + msg.join(" ") : ""
    throw new Assert(`not truthy: ${truthy}${msg}`)
  }
  
  static loc(err: Error): string {
    const stack = err.stack?.split("\n") || []
    for (const line of stack) {
      if (/^(Assert|eq|truthy)/.test(line)) continue 
      return line.substr(1)
    }
    return "(unknown)"
  }
}

render()

test("`throwing test` and `assertion test` must have ❌")
test("all other tests must be successful")
test("basic test", async() => {})
test("throwing test", async () => {
  throw new Error("ok")
})
test("assertion test", async () => {
  Assert.truthy("", "ok")
})
test("fetchCat() full range", async () => {
  Assert.eq(206, (await cat())[0])
  Assert.eq(52, (await cat())[1].length)
})
test("fetchCat() open end range", async () => {
  Assert.eq(206, (await cat(0))[0])
  Assert.eq(52, (await cat(0))[1].length)
  Assert.eq(206, (await cat(1))[0])
  Assert.eq(51, (await cat(1))[1].length)
  Assert.eq("bcde", (await cat(1))[1].substr(0, 4))
  Assert.eq(206, (await cat(24))[0])
  Assert.eq(28, (await cat(24))[1].length)
  Assert.eq("yzAB", (await cat(24))[1].substr(0, 4))
  Assert.eq(206, (await cat(50))[0])
  Assert.eq("YZ", (await cat(50))[1].substr(0, 4))
  Assert.eq(206, (await cat(51))[0])
  Assert.eq("Z", (await cat(51))[1].substr(0, 4))
  Assert.eq(416, (await cat(52))[0])
})
test("fetchCat() one-byte range", async () => {
  Assert.eq([206, "b"], await cat(1, 1))
  Assert.eq([206, "z"], await cat(25, 25))
  Assert.eq([206, "A"], await cat(26, 26))
  Assert.eq([206, "Z"], await cat(51, 51))
  Assert.eq(416, (await cat(52, 52))[0])
})
test("fetchCat() two-byte range", async () => {
  Assert.eq([206, "ab"], await cat(0, 1))
  Assert.eq([206, "yz"], await cat(24, 25))
  Assert.eq([206, "zA"], await cat(25, 26))
  Assert.eq([206, "YZ"], await cat(50, 51))
  Assert.eq(416, (await cat(51, 52))[0])
})
// TODO: test invalid parameters
// TODO: test content-length and other headers

async function cat(start?: number, end?: number): Promise<[number, string]> {
  const response = await fetchCat("part1.txt", "part2.txt", start, end)
  return [response.status, await response.text()]
}

async function test(title: string, f?: () => Promise<void>) {
  let err: Error | null = null

  if (f) try { await f() } catch (caught) { err = caught as Error }
  const [ mark, msg ] = f == null ? ["ℹ️", ""]
    : err === null ? [ "✅", "" ]
    : [ "❌", ": " + err + "\n    at " + Assert.loc(err) ]

  const main = document.querySelector("main") as HTMLElement
  main.insertAdjacentHTML('beforeend', `
    <pre style=margin:0;display>${mark}  ${title}${msg}</pre>  
  `)
}

function render() {
  const title = document.querySelector('title')?.innerText ?? "fetchCat"
  document.body.innerHTML = `
    <h1>${title}</h1>
    <h2>Tests</h2>
    <main style="border:1px dotted #ccc;margin-bottom:1em;overflow-x:scroll">
    </main>
    <h2>Sources</h2>
    <h3 id=srcTitle>Sources</h3>
    <textarea cols=80 rows=40 
      style=font-size:90%;letter-spacing:-.5px;border:0;background:#eee;
    ></textarea>
    <br>
    Click to see one:
    <a>index._html</a>
    <a>fetchCat.ts</a>
    <a>fetchCat.js</a>
    <a>test.ts</a>
    <a>test.js</a>
    <a>part1.txt</a>
    <a>part2.txt</a>
    <br>
    <small hidden id=hint
      >index._html has underscore to prevent live server injection</small>
  `

  const anchors = document.querySelectorAll("main ~ a")
  for (const anchor of anchors as NodeListOf<HTMLAnchorElement>) {
    const file = anchor.innerText
    anchor.href = "#;view-source=" + file + ";"
    anchor.addEventListener('click', () => viewSource(file))
  }
  const viewSourceMatch = location.hash.match(/;view-source=(.*?);/)
  if (viewSourceMatch?.[1]) viewSource(viewSourceMatch?.[1])

  async function viewSource(file: string) {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement
    textarea.value = await (await fetch(file)).text()
    
    const srcTitle = document.querySelector("#srcTitle") as HTMLElement
    srcTitle.innerText = file
    
    const hint = document.querySelector("#hint") as HTMLElement
    hint.hidden = file.indexOf("._html") == -1 
  }
}

//# sourceURL=test.js // make visible in DevTools