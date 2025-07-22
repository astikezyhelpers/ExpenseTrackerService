const uploadReceipt = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  console.log(req.file);

  const fileUrl = `/uploads/receipts/${req.file.filename}`;
  res.status(200).json({ message: 'Receipt uploaded successfully', fileUrl });
};


export {uploadReceipt};