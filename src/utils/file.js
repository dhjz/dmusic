// 1: plus.io.PRIVATE_WWW, 2: plus.io.PRIVATE_DOC, 3: plus.io.PUBLIC_DOCUMENTS, 4: plus.io.PUBLIC_DOWNLOADS
const LOCAL_DIRS = { 1: '_www', 2: '_doc', 3: '_documents', 4: '_downloads' }

function getSavedFileDir(type, dir, success, fail) {
  fail = fail || function () { }
  plus.io.requestFileSystem(type, fs => { // 请求_doc fs
    if (dir) {
      fs.root.getDirectory(dir, { create: true }, success, fail)
    } else {
      success(fs.root)
    }
  }, fail)
}

// 保存临时文件或者文本到指定目录
export function saveFile(options = {}) {
  let { text, tempFilePath, type = 4, dir = '', fileName, success, fail } = options
  fail = fail || function () { }
  if (!tempFilePath && !text) {
    fail('缺少临时文件路径tempFilePath')
    return
  }
  const savedFilePath = `${LOCAL_DIRS[type]}/${dir ? (dir + '/') : ''}${fileName}`
  if (!tempFilePath && text) {
    getSavedFileDir(type, dir, entry => {
      entry.getFile(fileName, { create: true }, function(fileEntry) {
        fileEntry.createWriter(function(writer) {
          // writer.seek(0)
          writer.write(text);
          writer.onwriteend = function() {
            success && success({ savedFilePath })
            console.log('文件写入成功', savedFilePath);
          };
        }, function(error) {
          console.error('文件写入失败:', fileName, error);
        });
      });
    }, fail)
  } else if (tempFilePath) { // 存在临时文件路径，则复制到指定目录
    plus.io.resolveLocalFileSystemURL(tempFilePath, entry => { // 读取临时文件 FileEntry
      getSavedFileDir(type, dir, saveDir => {
        entry.copyTo(saveDir, fileName, () => { // 复制临时文件 FileEntry，为了避免把相册里的文件删除，使用 copy，微信中是要删除临时文件的
          success && success({ savedFilePath })
        }, fail)
      }, fail)
    }, fail)
  }
}

export function getSavedFileList({ type = 4, dir = '', success, fail } = {}) {
  fail = fail || function () { }

  getSavedFileDir(type, dir, entry => {
    var reader = entry.createReader()

    var fileList = []
    reader.readEntries(entries => {
      if (entries && entries.length) {
        entries.forEach(entry => {
          entry.getMetadata(meta => {
            fileList.push({
              filePath: plus.io.convertAbsoluteFileSystem(entry.fullPath),
              createTime: meta.modificationTime.getTime(),
              size: meta.size
            })
            if (fileList.length === entries.length) {
              success && success({ fileList })
            }
          }, fail, false)
        })
      } else {
        success && success({ fileList })
      }
    }, fail)
  }, fail)
}

export function removeSavedFile ({ filePath, success, fail } = {}) {
  fail = fail || function () { }

  plus.io.resolveLocalFileSystemURL(filePath, entry => {
    entry.remove(() => {
      success && success()
    }, fail)
  }, fail)
}

export function uploadTextFile(url, text, filename = 'file.txt', header, success) {
  // 生成文件路径（App 端）
  // if (uni.getSystemInfoSync().uniPlatform === 'app') {
  //   saveFile({ text, filename, type: 4, dir: 'files', success: (res) => {
  //     uni.uploadFile({
  //       url,
  //       filePath: res.savedFilePath,
  //       name: 'file',
  //       header,
  //       formData: { filename },
  //       success: (res) => {
  //         console.log('上传成功', res.data);
  //       },
  //     })
  //   }})
  // } else {
    // const blob = new Blob([text], { type: 'text/plain' });
    // const file = new File([blob], filename, { type: 'text/plain' })
    // const formData = new FormData();
    // formData.append('file', file);
    // console.log(formData);
    // uni.request({
    //   url,
    //   method: 'PUT',
    //   data: formData.getBody(),
    //   header,
    //   success: (res) => {
    //     console.log('上传成功', res.data);
    //   }
    // });

    const boundary = `----WebKitFormBoundary${Date.now()}${Math.random().toString(36).substring(2)}`; // 随机生成一个 boundary

    // 构造请求体
    let body = `--${boundary}\r\n`;
    body += `Content-Disposition: form-data; name="file"; filename="${filename}"\r\n`;
    body += `Content-Type: text/plain\r\n\r\n`;
    body += text;
    body += `\r\n--${boundary}--`;

    // 发送 PUT 请求
    uni.request({
      url, // 替换为你的上传接口地址
      method: 'PUT',
      header: {
        ...header,
        'Content-Type': `multipart/form-data; boundary=${boundary}`, // 设置 Content-Type 和 boundary
      },
      data: body,
      success: (res) => {
        console.log('文件上传成功', res);
        success && success(res)
      },
      fail: (err) => {
        console.log('上传失败', err);
      }
    });
  // }
}