import React, { useState, useRef } from 'react';
import { verificationService } from '../../services/verificationService';

interface DocumentUploadProps {
  onUploadSuccess: () => void;
  onCancel: () => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ onUploadSuccess, onCancel }) => {
  const [documentType, setDocumentType] = useState<'RG' | 'CNH'>('RG');
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (type: 'front' | 'back' | 'photo', file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      setError('O arquivo deve ter no máximo 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (type === 'front') {
        setFrontFile(file);
        setFrontPreview(result);
      } else if (type === 'back') {
        setBackFile(file);
        setBackPreview(result);
      } else if (type === 'photo') {
        setPhotoFile(file);
        setPhotoPreview(result);
      }
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!frontFile || !backFile || !photoFile) {
      setError('Por favor, selecione ambos os lados do documento e sua selfie segurando o documento');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await verificationService.uploadDocuments(documentType, frontFile, backFile, photoFile);
      onUploadSuccess();
    } catch (error: any) {
      setError(error.response?.data?.error || 'Erro ao enviar documentos');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (type: 'front' | 'back' | 'photo') => {
    if (type === 'front') {
      setFrontFile(null);
      setFrontPreview(null);
      if (frontInputRef.current) frontInputRef.current.value = '';
    } else if (type === 'back') {
      setBackFile(null);
      setBackPreview(null);
      if (backInputRef.current) backInputRef.current.value = '';
    } else if (type === 'photo') {
      setPhotoFile(null);
      setPhotoPreview(null);
      if (photoInputRef.current) photoInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          📄 Verificação de Identidade
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Envie fotos do seu documento de identidade para verificar sua conta
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção do tipo de documento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Tipo de Documento
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="RG"
                checked={documentType === 'RG'}
                onChange={(e) => setDocumentType(e.target.value as 'RG')}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">RG (Carteira de Identidade)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="CNH"
                checked={documentType === 'CNH'}
                onChange={(e) => setDocumentType(e.target.value as 'CNH')}
                className="mr-2"
              />
              <span className="text-gray-700 dark:text-gray-300">CNH (Carteira de Motorista)</span>
            </label>
          </div>
        </div>

        {/* Upload da frente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Frente do Documento
          </label>
          {!frontPreview ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                ref={frontInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect('front', e.target.files[0])}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => frontInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                📷 Clique para selecionar a frente do documento
              </button>
              <p className="text-sm text-gray-500 mt-2">PNG, JPG até 5MB</p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={frontPreview}
                alt="Frente do documento"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removeFile('front')}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Upload do verso */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Verso do Documento
          </label>
          {!backPreview ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                ref={backInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect('back', e.target.files[0])}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => backInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                📷 Clique para selecionar o verso do documento
              </button>
              <p className="text-sm text-gray-500 mt-2">PNG, JPG até 5MB</p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={backPreview}
                alt="Verso do documento"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removeFile('back')}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Upload da foto do usuário */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sua selfie (segurando o documento)
          </label>
          {!photoPreview ? (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileSelect('photo', e.target.files[0])}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                🤳 Clique para tirar/selecionar sua selfie
              </button>
              <p className="text-sm text-gray-500 mt-2">PNG, JPG até 5MB</p>
              <p className="text-xs text-gray-400 mt-1">Tire uma selfie segurando o documento ao lado do seu rosto</p>
            </div>
          ) : (
            <div className="relative">
              <img
                src={photoPreview}
                alt="Sua selfie com documento"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removeFile('photo')}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Aviso de segurança */}
        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Informações importantes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Certifique-se de que o documento esteja legível e bem iluminado</li>
                <li>Não cubra nenhuma informação do documento</li>
                <li>Seus dados são protegidos e usados apenas para verificação</li>
                <li>O processo de análise pode levar até 24 horas</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Botões */}
        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={!frontFile || !backFile || isUploading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Enviando...' : 'Enviar para Verificação'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};