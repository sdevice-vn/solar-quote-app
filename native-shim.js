/* Cầu nối cho app Android: thay claude.use('downloads') bằng Filesystem + Share của Capacitor.
   index.html gốc không cần sửa. */
(function () {
  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result).split(',')[1]); };
      r.onerror = function () { reject(r.error); };
      r.readAsDataURL(blob);
    });
  }
  function saveFile(opts) {
    var cap = window.Capacitor;
    if (cap && cap.isNativePlatform && cap.isNativePlatform()) {
      var FS = cap.Plugins.Filesystem, Share = cap.Plugins.Share;
      return blobToBase64(opts.data).then(function (b64) {
        return FS.writeFile({ path: opts.filename, data: b64, directory: 'CACHE' });
      }).then(function (res) {
        return Share.share({ title: opts.filename, url: res.uri, dialogTitle: 'Lưu hoặc gửi báo giá' });
      }).catch(function (err) {
        var msg = String((err && err.message) || err || '').toLowerCase();
        if (msg.indexOf('cancel') !== -1) { var e = new Error('declined'); e.code = 'declined'; throw e; }
        throw err;
      });
    }
    /* chạy trên trình duyệt thường */
    var a = document.createElement('a');
    a.href = URL.createObjectURL(opts.data); a.download = opts.filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    return Promise.resolve();
  }
  window.claude = window.claude || {};
  window.claude.use = function (name) {
    return Promise.resolve(name === 'downloads' ? { save: saveFile } : null);
  };
})();
