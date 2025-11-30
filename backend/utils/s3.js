const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Configurar cliente S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/**
 * Faz upload de um arquivo para o S3
 * @param {Buffer} fileBuffer - Buffer do arquivo
 * @param {string} key - Caminho/nome do arquivo no S3
 * @param {string} contentType - Tipo MIME do arquivo
 * @returns {Promise<string>} URL do arquivo no S3
 */
const uploadToS3 = async (fileBuffer, key, contentType) => {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType
    });

    await s3Client.send(command);
    
    // Retornar a chave do arquivo (não a URL pública)
    return key;
  } catch (error) {
    console.error('❌ Erro ao fazer upload para S3:', error);
    throw new Error('Falha ao fazer upload do arquivo');
  }
};

/**
 * Gera uma URL assinada para download de arquivo
 * @param {string} key - Chave do arquivo no S3
 * @param {number} expiresIn - Tempo de expiração em segundos (padrão: 1 hora)
 * @returns {Promise<string>} URL assinada
 */
const getSignedDownloadUrl = async (key, expiresIn = 3600) => {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('❌ Erro ao gerar URL assinada:', error);
    throw new Error('Falha ao gerar URL de download');
  }
};

/**
 * Deleta um arquivo do S3
 * @param {string} key - Chave do arquivo no S3
 * @returns {Promise<void>}
 */
const deleteFromS3 = async (key) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key
    });

    await s3Client.send(command);
    console.log(`✅ Arquivo deletado do S3: ${key}`);
  } catch (error) {
    console.error('❌ Erro ao deletar arquivo do S3:', error);
    throw new Error('Falha ao deletar arquivo');
  }
};

/**
 * Gera uma chave única para o arquivo no S3
 * @param {string} userId - ID do usuário
 * @param {string} folder - Pasta no S3
 * @param {string} filename - Nome original do arquivo
 * @returns {string} Chave única
 */
const generateS3Key = (userId, folder, filename) => {
  const timestamp = Date.now();
  const extension = filename.split('.').pop();
  return `${folder}/${userId}/${timestamp}.${extension}`;
};

module.exports = {
  uploadToS3,
  getSignedDownloadUrl,
  deleteFromS3,
  generateS3Key
};
