class RequestUtil {
  static request = new RequestUtil()

  async get<T extends RequestInit>(url: string, options?: T) {
    const response = await fetch(url, options)
    const textData = await response.text()
    try {
      textData && JSON.parse(textData)
    }
    catch (e) {
      const error = new SyntaxError('JSON.parse error')
      // eslint-disable-next-line no-console
      console.warn(
        `
        ${error.name}: ${error.message}\n\trequest: ${url} response data is not json format, \n\tplease ensure the response data is json format.
        `.trim(),
      )
      return textData
    }
    return JSON.parse(textData)
  }
}

export default RequestUtil.request
