import multer from 'multer'

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/pjpeg', 'image/png', 'image/gif', 'image/webp']
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Tipo de arquivo de imagem inválido.'), false)
  }
}

const storage = multer.memoryStorage()

const upload = multer({
  storage: storage,
  fileFilter: fileFilter
})

export default upload
