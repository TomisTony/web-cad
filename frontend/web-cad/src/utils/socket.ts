export class Socket {
  public socket: WebSocket
  public onmessage: any = () => {
    console.log("WebSocket message")
  }
  public onopen: any = () => {
    console.log("WebSocket connected")
  }
  public onclose: any = () => {
    console.log("WebSocket closed")
    this.reconnect()
  }
  public onerror: any = () => {
    console.log("WebSocket error")
    this.socket.close()
  }

  constructor(
    url: string,
    onmessage?: any,
    onopen?: any,
    onclose?: any,
    onerror?: any,
  ) {
    if (onopen) this.onopen = onopen
    if (onmessage) this.onmessage = onmessage
    if (onclose) this.onclose = onclose
    if (onerror) this.onerror = onerror

    this.socket = new WebSocket(url)
    this.socket.onopen = this.onopen
    this.socket.onmessage = this.onmessage
    this.socket.onclose = this.onclose
    this.socket.onerror = this.onerror
  }

  public reconnect() {
    console.log("Socket is closed. Reconnect will be attempted in 1 second.")
    setTimeout(() => {
      this.socket = new WebSocket("ws://localhost:8000/websocket?projectId=1")
      this.socket.onclose = this.onclose
      this.socket.onmessage = this.onmessage
      this.socket.onopen = this.onopen
    }, 1000)
  }

  public manualClose() {
    if (this.socket) {
      this.socket.onclose = () => {
        console.log("WebSocket manual closed")
      }
      this.socket.close()
    }
  }
}
