const { app, BrowserWindow, ipcMain } = require('electron');

const { autoUpdater } = require("electron-updater");


// http://192.168.1.137:8090/download/flavor/lxy/1.0.1/windows_64/init.exe


function createWindow() {
  // 创建浏览器窗口
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // 并且为你的应用加载index.html
  mainWindow.loadFile('index.html')

  mainWindow.webContents.openDevTools()




  function updateHandle(){
    let message={
      error:'检查更新出错',
      checking:'正在检查更新……',
      updateAva:'检测到新版本，正在下载……',
      updateNotAva:'现在使用的就是最新版本，不用更新',
    };
    const os = require('os');
    autoUpdater.setFeedURL('http://192.168.1.137:8090/update/windows_64/');
    autoUpdater.on('error', function(error){
      sendUpdateMessage(message.error)
    });
    autoUpdater.on('checking-for-update', function() {
      sendUpdateMessage(message.checking)
    });
    autoUpdater.on('update-available', function(info) {
        sendUpdateMessage(message.updateAva)
    });
    autoUpdater.on('update-not-available', function(info) {
        sendUpdateMessage(message.updateNotAva)
    });
    
    // 更新下载进度事件
    autoUpdater.on('download-progress', function(progressObj) {
        mainWindow.webContents.send('downloadProgress', progressObj)
    })
    autoUpdater.on('update-downloaded',  function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
        ipcMain.on('isUpdateNow', (e, arg) => {
            //some code here to handle event
            autoUpdater.quitAndInstall();
        })
        mainWindow.webContents.send('isUpdateNow')
    });
    
    //执行自动更新检查
    autoUpdater.checkForUpdates();
  }
  
  // 通过main进程发送事件给renderer进程，提示更新信息
  // mainWindow = new BrowserWindow()
  function sendUpdateMessage(text){
    mainWindow.webContents.send('message', text)
  }
  

  

  updateHandle();

}

app.whenReady().then(createWindow)
