// イントロドン用の差し替え（ReaCast のファイルではありません）
// ReaCast の演出(overlay.js)は、OBS で開かれた時は自分のPCの ReaCast に WebSocket で繋いで
// リアクションを受け取る。イントロドンでは参加者のPCに ReaCast は無いので、
// WebSocket を「親のイントロドン画面から postMessage で届いたものを渡すだけ」の偽物に差し替える。
// overlay.js 自体は一切書き換えずに、そのまま使える。
(function () {
  const sockets = [];
  function BridgeSocket() {
    this._handlers = {};
    sockets.push(this);
  }
  BridgeSocket.prototype.addEventListener = function (type, fn) {
    (this._handlers[type] = this._handlers[type] || []).push(fn);
  };
  BridgeSocket.prototype.send = function () {};
  BridgeSocket.prototype.close = function () {};
  window.WebSocket = BridgeSocket;

  window.addEventListener('message', (event) => {
    // 同じサイトのイントロドン画面（親）から届いたものだけ受け取る
    if (event.origin !== location.origin || event.source !== window.parent) return;
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    const text = JSON.stringify(data);
    sockets.forEach((s) => (s._handlers.message || []).forEach((fn) => fn({ data: text })));
  });
})();
