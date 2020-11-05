const electron = require("electron")
const path = require("path")
const { v4 } = require("uuid")
const os = require("os")
const { resolve } = require("path")
const { readdir } = require("fs").promises
const fs = require("fs")

const dialog = electron.remote.dialog

async function getFiles(dir) {
  const dirents = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    dirents.map((dirent) => {
      const res = resolve(dir, dirent.name)
      if (dirent.isDirectory()) {
        return getFiles(res)
      } else {
        return dirent.name.match(fileExtension) !== null ? res : undefined
      }
    })
  )
  return Array.prototype.concat(...files).filter(Boolean)
}

const resultPath = `${os.homedir()}/Desktop/result`

if (!fs.existsSync(resultPath)) {
  fs.mkdirSync(resultPath)
}

const fileExtension = /(.+)\.(jpg|jpeg|png|heic|heif|mov)/

const baseDirEl = document.getElementById("base")
const destDirEl = document.getElementById("dest")
const submitEl = document.getElementById("submit")

let baseDir = null
let destDir = null

// Defining a Global file path Variable to store
// user-selected file
global.filepath = undefined

baseDirEl.addEventListener("click", () => {
  // If the platform is 'darwin' (macOS)
  dialog
    .showOpenDialog({
      title: "Select Base Directory",
      defaultPath: path.join(__dirname, "../assets/"),
      buttonLabel: "Add",
      // Specifying the File Selector and Directory
      // Selector Property In macOS
      properties: ["openDirectory"],
    })
    .then((upload) => {
      if (upload.canceled) {
        return
      }

      const [path] = upload.filePaths

      baseDir = path
      document.getElementById("basePath").append(path)
    })
    .catch((err) => {
      console.log(err)
    })
})

destDirEl.addEventListener("click", () => {
  // If the platform is 'darwin' (macOS)
  dialog
    .showOpenDialog({
      title: "Select Destination Directory",
      defaultPath: path.join(__dirname, "../assets/"),
      buttonLabel: "Add",
      // Specifying the File Selector and Directory
      // Selector Property In macOS
      properties: ["openDirectory"],
    })
    .then((upload) => {
      if (upload.canceled) {
        return
      }

      const [path] = upload.filePaths

      destDir = path
      document.getElementById("destPath").append(path)
    })
    .catch((err) => {
      console.log(err)
    })
})

submitEl.addEventListener("click", () => {
  getFiles(baseDir).then((result) =>
    result.forEach((path) => {
      const [, , extension] = path.match(fileExtension)
      fs.copyFileSync(path, `${destDir}/${v4()}.${extension}`)
    })
  )
})
