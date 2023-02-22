async function fetchCat(
  first: string,
  main: string,
  rangeStart: number = 0,
  rangeEnd: number = 0,
): Promise<Response> {
  if (rangeStart !== (rangeStart | 0))
    throw new Error("rangeStart not an integer")
  if (rangeEnd !== (rangeEnd | 0))
    throw new Error("rangeEnd not an integer")
  if (rangeEnd && rangeStart > rangeEnd)
    throw new Error("rangeStart larger than rangeEnd")
  
  function size(response: Response): number {
    const contentLength = response.headers.get("content-length")
    if (contentLength == null)
      throw new Error("response without  content-length")
    return +contentLength
  }
  
  function range(rangeStart: number | "", rangeEnd: number | "") {
    const range = `bytes=${rangeStart}-${rangeEnd}`
    //console.debug("range", range) 
    return { headers: { range } }
  }

  // get first part's content size
  const headResp = await fetch(first, { method: "HEAD" })
  if (!headResp.ok) return headResp // failed request: 404 &c
  const firstSize = size(headResp)

  // only main part if range start is beyond first part
  if (rangeStart >= firstSize) {
    const end = rangeEnd ? rangeEnd - firstSize : ""
    return fetch(main, range(rangeStart - firstSize, end));
  }
  
  // only first part if range end is within first part
  if (rangeEnd && rangeEnd < firstSize) {
    return fetch(first, range(rangeStart, rangeEnd));
  }

  // fetch first part
  const firstRangeEnd = rangeEnd && rangeEnd < firstSize ? rangeEnd : ""
  const firstResp = await fetch(first, range(rangeStart, firstRangeEnd))
  if (!firstResp.ok) return firstResp

  // fetch main part
  const mainRangeStart = rangeStart < firstSize ? 0 : rangeStart - firstSize
  const mainRangeEnd = rangeEnd < firstSize ? "" : rangeEnd - firstSize
  const mainResp = await fetch(main, range(mainRangeStart, mainRangeEnd))
  if (!mainResp.ok) return mainResp

  // create concatenated ReadableStream
  const catStream = new ReadableStream({ 
    type: "bytes", 
    start: async function(controller: ReadableByteStreamController) {
      // read first part
      const firstReader = firstResp.body?.getReader()
      if (!firstReader) throw new Error("first response without body")
      while (true) {
        const { value, done } = await firstReader.read()
        if (done) break
        controller.enqueue(value)
      }

      // read main part
      const mainReader = mainResp.body?.getReader()
      if (!mainReader) throw new Error("main response without body")
      while (mainReader) {
        const { value, done } = await mainReader.read()
        if (done) break
        controller.enqueue(value)
      }

      // finished!
      controller.close()
    },
  })

  // create concatenated Response
  const status = mainResp.status
  const statusText = mainResp.statusText  
  const headers = new Headers(mainResp.headers)
  const totalSize = size(firstResp) + size(mainResp)
  headers.set("content-length", totalSize.toString())
  
  return new Response(catStream, { status, statusText, headers })
}

//# sourceURL=fetchCat.js // make visible in DevTools
